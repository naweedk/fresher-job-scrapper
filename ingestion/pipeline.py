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
from processors.normalizer import normalize_job
from processors.validators import validate_raw_job
from schemas import ClassificationStatusEnum, RawJob, SourceTypeEnum

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
            "duplicates_found": 0,
            "new_jobs_inserted": 0,
            "existing_jobs_updated": 0,
            "jobs_classified_successfully": 0,
            "jobs_classification_failed": 0,
            "classification_tokens": 0,
            "classification_cost_usd": 0.0,
            "elapsed_seconds": 0.0,
        }

        with get_db_connection() as conn:
            source_repo = SourceRepository(conn)
            company_repo = CompanyRepository(conn)
            job_repo = JobRepository(conn)
            log_repo = IngestionLogRepository(conn)

            for collector in collectors:
                logger.info("=== Starting ingestion for source: %s ===", collector.name)
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
                        else:
                            duplicate_count += 1
                            pipeline_summary["duplicates_found"] += 1

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

                except Exception as e:
                    logger.error("Source %s failed: %s", collector.name, e)
                    log_repo.complete_log(
                        log_id=log_id,
                        fetched=fetched_count,
                        inserted=inserted_count,
                        duplicates=duplicate_count,
                        failed=failed_count,
                        status="FAILED",
                        error_message=str(e),
                    )
                    pipeline_summary["sources_failed"] += 1

        # Stage: Classify pending jobs
        classify_summary = self.classify_pending(limit=self.settings.classification_batch_size)
        pipeline_summary["jobs_classified_successfully"] = classify_summary["success"]
        pipeline_summary["jobs_classification_failed"] = classify_summary["failed"]
        pipeline_summary["classification_tokens"] = self.classifier.usage.total_tokens
        pipeline_summary["classification_cost_usd"] = self.classifier.usage.estimated_cost_usd

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
            pending_jobs = job_repo.get_pending_classifications(limit=limit)
            logger.info("Found %d jobs awaiting AI classification", len(pending_jobs))

            for idx, job in enumerate(pending_jobs):
                summary["processed"] += 1
                job_id = job["job_id"]
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
                    # Mark as FAILED so it can be retried or inspected
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

                # Pacing delay between requests to respect rate limits
                if idx < len(pending_jobs) - 1:
                    time.sleep(pacing_delay)

        return summary
