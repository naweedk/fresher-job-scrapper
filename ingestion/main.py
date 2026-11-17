"""
Fresher Jobs India — Python Ingestion CLI Entry Point

Usage:
    python main.py --stage all
    python main.py --stage collect --source arbeitnow
    python main.py --stage classify --limit 20
    python main.py --stage test-db
"""

import argparse
import logging
import sys

from config import get_settings
from database.connection import check_db_health
from pipeline import IngestionPipeline

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("main")


def print_banner(settings):
    print("=" * 65)
    print("  Fresher Jobs India — Data Ingestion & AI Pipeline")
    print("=" * 65)
    print(f"  Environment  : {settings.environment}")
    print(f"  Log level    : {settings.log_level}")
    print(f"  Database     : {settings.database_url_display}")
    print(f"  Gemini Model : {settings.gemini_model}")
    print(f"  AI Key Set   : {bool(settings.gemini_api_key)}")
    print("=" * 65)
    print()


def main():
    parser = argparse.ArgumentParser(description="Fresher Jobs India Ingestion Engine")
    parser.add_argument(
        "--stage",
        choices=["all", "collect", "classify", "filter-india", "test-db"],
        default="all",
        help="Pipeline stage to execute (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="For filter-india stage, evaluate without writing to database",
    )
    parser.add_argument(
        "--source",
        type=str,
        default=None,
        help="Optional single source filter (e.g. arbeitnow, remotive, remoteok, hasjob, simplify_jobs)",
    )
    parser.add_argument(
        "--pages",
        type=int,
        default=5,
        help="Max pages/batches to fetch per source (default: 5)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Max records to classify (default: 20)",
    )

    args = parser.parse_args()
    settings = get_settings()
    print_banner(settings)

    if args.stage == "test-db":
        is_healthy = check_db_health()
        print(f"Database Connectivity Test: {'SUCCESS' if is_healthy else 'FAILED'}")
        sys.exit(0 if is_healthy else 1)

    pipeline = IngestionPipeline()

    if args.stage in ("all", "collect"):
        logger.info("Executing collection, normalization, deduplication, and persistence...")
        summary = pipeline.run_all(source_name=args.source, max_pages=args.pages)

        print("\n" + "=" * 65)
        print("  EXECUTION SUMMARY")
        print("=" * 65)
        print(f"  Sources attempted       : {summary['sources_attempted']}")
        print(f"  Sources successful      : {summary['sources_successful']}")
        print(f"  Sources failed          : {summary['sources_failed']}")
        print(f"  Total listings fetched  : {summary['total_fetched']}")
        print(f"  Valid eligible jobs     : {summary['valid_jobs']}")
        print(f"  Rejected listings       : {summary['rejected_jobs']}")
        print(f"  Rejected outside India  : {summary.get('rejected_outside_india', 0)}")
        print(f"  Sent for review (ambig) : {summary.get('sent_for_review_ambiguous', 0)}")
        print(f"  New jobs inserted       : {summary['new_jobs_inserted']}")
        print(f"  Verified Indian inserted: {summary.get('verified_indian_inserted', 0)}")
        print(f"  Duplicates detected     : {summary['duplicates_found']}")
        print(f"  Expired jobs marked     : {summary.get('expired_jobs_marked', 0)}")
        print(f"  Jobs classified (AI)    : {summary['jobs_classified_successfully']}")
        print(f"  Classification failures : {summary['jobs_classification_failed']}")
        print(f"  Total AI tokens consumed: {summary['classification_tokens']}")
        print(f"  Estimated AI cost (USD) : ${summary['classification_cost_usd']:.4f}")
        print(f"  Total execution time    : {summary['elapsed_seconds']}s")
        print("=" * 65 + "\n")

    elif args.stage == "filter-india":
        from backfill_india_eligibility import run_backfill
        logger.info("Executing India eligibility filter and backfill (dry_run=%s)...", args.dry_run)
        run_backfill(dry_run=args.dry_run)

    elif args.stage == "classify":
        logger.info("Executing AI classification stage only (limit=%d)...", args.limit)
        summary = pipeline.classify_pending(limit=args.limit)
        print(f"\nClassification Summary: {summary}\n")


if __name__ == "__main__":
    main()
