"""
Pipeline orchestrator executing end-to-end ingestion, deduplication, persistence, and classification.
"""

import logging
import time
from typing import Dict, List, Optional

from collectors import get_all_collectors, get_collector
from config import get_settings
from database.company_repository import CompanyRepository
from database.connection import get_db_connection
from database.ingestion_log_repository import IngestionLogRepository
from database.job_repository import JobRepository
from database.source_repository import SourceRepository
from processors.ai_classifier import GeminiClassifier
from processors.eligibility import check_fresher_eligibility
from processors.freshness import evaluate_job_freshness, FreshnessStatus
from processors.normalizer import normalize_job
from processors.validators import validate_raw_job
from schemas import ClassificationStatusEnum, IndiaEligibilityEnum, RawJob, SourceTypeEnum

logger = logging.getLogger(__name__)


class IngestionPipeline:
    """Coordinates collectors, normalization, deduplication, and AI classification."""

    def __init__(self):
        self.settings = get_settings()
        self.classifier = GeminiClassifier()

    def run_all(self, source_name: Optional[str] = None, max_pages: int = 5) -> Dict:
        """Execute complete pipeline across active or specific collectors."""
        start_time = time.time()
        collectors = [get_collector(source_name)] if source_name else get_all_collectors()

        pipeline_summary = {
            "sources_attempted": len(collectors),
            "sources_successful": 0,
            "sources_failed": 0,
            "total_fetched": 0,
            "valid_jobs": 0,
            "rejected_jobs": 0,
            "rejected_outside_india": 0,
            "sent_for_review_ambiguous": 0,
            "duplicates_found": 0,
            "new_jobs_inserted": 0,
            "verified_indian_inserted": 0,
            "posted_within_24h": 0,
            "posted_within_3d": 0,
            "posted_within_7d": 0,
            "posted_within_14d": 0,
            "posted_within_30d": 0,
            "posted_stale": 0,
            "posted_unknown": 0,
            "existing_jobs_updated": 0,
            "expired_jobs_marked": 0,
            "jobs_classified_successfully": 0,
            "jobs_classification_failed": 0,
            "classification_tokens": 0,
            "classification_cost_usd": 0.0,
            "elapsed_seconds": 0.0,
            "per_source": {},
        }

        # Step 0: Daily Refresh - mark expired jobs
        try:
            with get_db_connection() as conn:
                job_repo = JobRepository(conn)
                expired_count = job_repo.mark_expired_jobs()
                pipeline_summary["expired_jobs_marked"] = expired_count
                if expired_count > 0:
                    logger.info("Marked %d past jobs as EXPIRED", expired_count)
        except Exception as exp_err:
            logger.warning("Error marking expired jobs: %s", exp_err)

        # Step 1: Collect & Ingest per source
        for collector in collectors:
            logger.info("=== Starting ingestion for source: %s ===", collector.name)
            source_stats = {
                "fetched": 0,
                "inserted": 0,
                "verified_indian": 0,
                "duplicates": 0,
                "rejected": 0,
                "status": "PENDING",
            }

            try:
                with get_db_connection() as conn:
                    source_repo = SourceRepository(conn)
                    company_repo = CompanyRepository(conn)
                    job_repo = JobRepository(conn)
                    log_repo = IngestionLogRepository(conn)

                    # Ensure source registered in DB
                    db_source = source_repo.get_or_create(
                        name=collector.name,
                        source_type=SourceTypeEnum.API if "rss" not in collector.name.lower() else SourceTypeEnum.RSS,
                        base_url=collector.base_url,
                    )
                    source_id = db_source["id"]
                    log_record = log_repo.create_log(source_id)
                    log_id = log_record["id"]

                    fetched_count = 0
                    inserted_count = 0
                    duplicate_count = 0
                    failed_count = 0

                    try:
                        raw_jobs: List[RawJob] = collector.fetch_jobs(max_pages=max_pages)
                        fetched_count = len(raw_jobs)
                        source_stats["fetched"] = fetched_count
                        pipeline_summary["total_fetched"] += fetched_count

                        for raw in raw_jobs:
                            # 1. Validation
                            is_valid, val_reason = validate_raw_job(raw)
                            if not is_valid:
                                logger.debug("Rejected job '%s': %s", raw.title, val_reason)
                                failed_count += 1
                                pipeline_summary["rejected_jobs"] += 1
                                continue

                            # 2. Normalization
                            normalized = normalize_job(raw, source_id=source_id)

                            # 3. Eligibility filter
                            is_eligible, elig_reason = check_fresher_eligibility(normalized)
                            if not is_eligible:
                                logger.debug("Ineligible job '%s': %s", normalized.title, elig_reason)
                                failed_count += 1
                                pipeline_summary["rejected_jobs"] += 1
                                continue

                            # Track India location breakdown
                            if normalized.india_eligibility == IndiaEligibilityEnum.INTERNATIONAL:
                                pipeline_summary["rejected_outside_india"] += 1
                            elif normalized.india_eligibility == IndiaEligibilityEnum.AMBIGUOUS:
                                pipeline_summary["sent_for_review_ambiguous"] += 1

                            pipeline_summary["valid_jobs"] += 1

                            # 4. Resolve company
                            company = company_repo.get_or_create(
                                name=normalized.company_name,
                                website=normalized.company_url,
                                logo_url=normalized.company_logo,
                            )

                            # 5. Deduplicate and persist
                            _, is_new = job_repo.upsert_job(
                                job=normalized,
                                company_id=company["id"],
                            )

                            if is_new:
                                inserted_count += 1
                                pipeline_summary["new_jobs_inserted"] += 1
                                if normalized.india_eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN:
                                    source_stats["verified_indian"] += 1
                                    pipeline_summary["verified_indian_inserted"] += 1

                                    # Track freshness
                                    fresh_status = evaluate_job_freshness(normalized.posted_at)
                                    if fresh_status == FreshnessStatus.UNKNOWN:
                                        pipeline_summary["posted_unknown"] += 1
                                    elif fresh_status == FreshnessStatus.STALE:
                                        pipeline_summary["posted_stale"] += 1
                                    elif fresh_status in (FreshnessStatus.FRESH, FreshnessStatus.RECENT):
                                        pipeline_summary["posted_within_30d"] += 1
                                        if normalized.posted_at:
                                            age_days = (time.time() - normalized.posted_at.timestamp()) / 86400.0
                                            if age_days <= 1.0:
                                                pipeline_summary["posted_within_24h"] += 1
                                            if age_days <= 3.0:
                                                pipeline_summary["posted_within_3d"] += 1
                                            if age_days <= 7.0:
                                                pipeline_summary["posted_within_7d"] += 1
                                            if age_days <= 14.0:
                                                pipeline_summary["posted_within_14d"] += 1
                            else:
                                duplicate_count += 1
                                pipeline_summary["duplicates_found"] += 1

                        source_stats["inserted"] = inserted_count
                        source_stats["duplicates"] = duplicate_count
                        source_stats["rejected"] = failed_count
                        source_stats["status"] = "COMPLETED"

                        # Log success for this source
                        log_repo.complete_log(
                            log_id=log_id,
                            fetched=fetched_count,
                            inserted=inserted_count,
                            duplicates=duplicate_count,
                            failed=failed_count,
                            status="COMPLETED",
                        )
                        pipeline_summary["sources_successful"] += 1

                    except Exception as source_err:
                        logger.error("Source %s failed: %s", collector.name, source_err)
                        source_stats["status"] = "FAILED"
                        source_stats["error"] = str(source_err)
                        log_repo.complete_log(
                            log_id=log_id,
                            fetched=fetched_count,
                            inserted=inserted_count,
                            duplicates=duplicate_count,
                            failed=failed_count,
                            status="FAILED",
                            error_message=str(source_err),
                        )
                        pipeline_summary["sources_failed"] += 1

            except Exception as conn_err:
                logger.error("Database connection failed for source %s: %s", collector.name, conn_err)
                source_stats["status"] = "FAILED"
                source_stats["error"] = str(conn_err)
                pipeline_summary["sources_failed"] += 1

            pipeline_summary["per_source"][collector.name] = source_stats

        # Step 2: Classify pending jobs (safe, does not block ingestion)
        try:
            classify_summary = self.classify_pending(limit=self.settings.classification_batch_size)
            pipeline_summary["jobs_classified_successfully"] = classify_summary["success"]
            pipeline_summary["jobs_classification_failed"] = classify_summary["failed"]
            pipeline_summary["classification_tokens"] = self.classifier.usage.total_tokens
            pipeline_summary["classification_cost_usd"] = self.classifier.usage.estimated_cost_usd
        except Exception as class_err:
            logger.warning("Classification stage failed gracefully (does not affect collection): %s", class_err)

        pipeline_summary["elapsed_seconds"] = round(time.time() - start_time, 2)
        return pipeline_summary

    def classify_pending(self, limit: int = 20, pacing_delay: float = 4.0) -> Dict:
        """
        Classify jobs currently in PENDING status using Gemini.
        Applies pacing_delay between requests to operate comfortably within Free Tier limits.
        """
        summary = {"processed": 0, "success": 0, "failed": 0, "skipped": 0}

        if not self.classifier.is_available:
            logger.warning(
                "Gemini API key is not configured. Skipping LLM classification stage. "
                "Pending jobs remain in PENDING status."
            )
            summary["skipped"] = limit
            return summary

        with get_db_connection() as conn:
            job_repo = JobRepository(conn)
            # Only classify verified Indian jobs awaiting classification
            pending_jobs = job_repo.get_pending_classifications(limit=limit)
            logger.info("Found %d jobs awaiting AI classification", len(pending_jobs))

            for idx, job in enumerate(pending_jobs):
                if not self.classifier.is_available:
                    remaining = len(pending_jobs) - idx
                    logger.info("AI classifier unavailable or quota exhausted. Skipping remaining %d pending classifications.", remaining)
                    summary["skipped"] += remaining
                    break

                summary["processed"] += 1
                job_id = job["job_id"]
                try:
                    result, err = self.classifier.classify_job(job)

                    if result:
                        job_repo.update_classification(
                            job_id=job_id,
                            role=result.role,
                            city=result.city,
                            job_type=result.job_type.value if result.job_type else None,
                            experience_level=result.experience_level.value if result.experience_level else None,
                            work_mode=result.work_mode.value if result.work_mode else None,
                            skills=result.skills,
                            confidence=result.confidence,
                            model_name=result.model_name,
                            prompt_version=result.prompt_version,
                            status=result.status.value,
                        )
                        summary["success"] += 1
                        logger.info("Classified job [%d/%d] '%s' -> %s (%s)", idx + 1, len(pending_jobs), job["title"][:35], result.role, result.city)
                    else:
                        job_repo.update_classification(
                            job_id=job_id,
                            role=None,
                            city=None,
                            job_type=None,
                            experience_level=None,
                            work_mode=None,
                            skills=[],
                            confidence=0.0,
                            model_name=self.classifier.model_name,
                            prompt_version=self.classifier.prompt_version,
                            status=ClassificationStatusEnum.FAILED.value,
                        )
                        summary["failed"] += 1
                        logger.warning("Classification failed for job [%d/%d] '%s': %s", idx + 1, len(pending_jobs), job["title"][:35], err)
                except Exception as ex:
                    summary["failed"] += 1
                    logger.warning("Exception during classification of job %s: %s", job_id, ex)

                # Pacing delay between requests to respect rate limits
                if idx < len(pending_jobs) - 1:
                    time.sleep(pacing_delay)

        return summary
