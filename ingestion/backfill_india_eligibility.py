"""
Safe Backfill and Filtering Process for India Job Eligibility.

Inspects all existing jobs in PostgreSQL, applies the location & work-mode
eligibility engine, and tags them as:
- VERIFIED_INDIAN
- INTERNATIONAL
- AMBIGUOUS

Supports a --dry-run option before updating existing data.
No database records are deleted.
"""

import argparse
import logging
import sys
from typing import Dict, List

from database.connection import get_db_connection
from processors.india_eligibility import evaluate_india_eligibility
from schemas import IndiaEligibilityEnum, WorkModeEnum

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("backfill_india")


def run_backfill(dry_run: bool = True) -> Dict:
    """
    Evaluates all existing jobs and updates their India eligibility fields.
    If dry_run is True, prints evaluation results without database writes.
    """
    logger.info("=== Starting India Eligibility Evaluation (dry_run=%s) ===", dry_run)

    stats = {
        "total_jobs": 0,
        "verified_indian": 0,
        "international": 0,
        "ambiguous": 0,
        "work_modes": {
            WorkModeEnum.ONSITE.value: 0,
            WorkModeEnum.HYBRID.value: 0,
            WorkModeEnum.REMOTE.value: 0,
            WorkModeEnum.UNKNOWN.value: 0,
        },
        "indian_cities": {},
        "samples_indian": [],
        "samples_international": [],
        "samples_ambiguous": [],
    }

    updates: List[Tuple] = []

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, title, description, location
                FROM jobs
                ORDER BY "createdAt" ASC;
            """)
            jobs = cur.fetchall()
            stats["total_jobs"] = len(jobs)
            logger.info("Fetched %d existing jobs from database for evaluation", len(jobs))

            for job in jobs:
                job_id = job["id"]
                title = job["title"] or ""
                description = job["description"] or ""
                location = job["location"]

                res = evaluate_india_eligibility(
                    location=location,
                    title=title,
                    description=description,
                )

                if res.eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN:
                    stats["verified_indian"] += 1
                    stats["work_modes"][res.work_mode.value] += 1
                    city_key = res.city or "Remote / Pan-India"
                    stats["indian_cities"][city_key] = stats["indian_cities"].get(city_key, 0) + 1

                    if len(stats["samples_indian"]) < 8:
                        stats["samples_indian"].append({
                            "title": title[:40],
                            "location": location,
                            "normalized_city": res.city,
                            "work_mode": res.work_mode.value,
                            "reason": res.reason,
                        })

                elif res.eligibility == IndiaEligibilityEnum.INTERNATIONAL:
                    stats["international"] += 1
                    if len(stats["samples_international"]) < 8:
                        stats["samples_international"].append({
                            "title": title[:40],
                            "location": location,
                            "reason": res.reason,
                        })

                else:
                    stats["ambiguous"] += 1
                    if len(stats["samples_ambiguous"]) < 8:
                        stats["samples_ambiguous"].append({
                            "title": title[:40],
                            "location": location,
                            "reason": res.reason,
                        })

                updates.append((
                    res.country_code,
                    res.work_mode.value,
                    res.eligibility.value,
                    res.remote_scope,
                    res.city if res.city else location,
                    job_id,
                ))

            if not dry_run:
                logger.info("Applying updates for %d records to PostgreSQL...", len(updates))
                # Batch update
                cur.executemany(
                    """
                    UPDATE jobs
                    SET "countryCode" = %s,
                        "workMode" = %s::"WorkMode",
                        "indiaEligibility" = %s::"IndiaEligibility",
                        "remoteEligibilityScope" = %s,
                        location = %s,
                        "updatedAt" = NOW()
                    WHERE id = %s;
                    """,
                    updates,
                )
                logger.info("Successfully persisted India eligibility for all %d jobs", len(updates))

    print("\n" + "=" * 65)
    print("  INDIA ELIGIBILITY EVALUATION REPORT" + (" (DRY RUN)" if dry_run else " (APPLIED)"))
    print("=" * 65)
    print(f"  Total records evaluated   : {stats['total_jobs']}")
    print(f"  Verified Indian jobs      : {stats['verified_indian']}")
    print(f"  International excluded    : {stats['international']}")
    print(f"  Ambiguous / Review        : {stats['ambiguous']}")
    print("\n  Work Modes for Verified Indian Jobs:")
    for mode, count in stats["work_modes"].items():
        print(f"    - {mode:10}: {count}")

    print("\n  Top Indian Locations:")
    for city, count in sorted(stats["indian_cities"].items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    - {city:20}: {count}")

    print("\n  Sample Verified Indian Listings:")
    for s in stats["samples_indian"]:
        print(f"    [INDIAN] {s['title']} | Loc: {s['location']} | WorkMode: {s['work_mode']} | Reason: {s['reason']}")

    print("\n  Sample International Listings Excluded:")
    for s in stats["samples_international"]:
        print(f"    [EXCLUDED] {s['title']} | Loc: {s['location']} | Reason: {s['reason']}")

    print("\n  Sample Ambiguous Listings Held For Review:")
    for s in stats["samples_ambiguous"]:
        print(f"    [AMBIGUOUS] {s['title']} | Loc: {s['location']} | Reason: {s['reason']}")

    print("=" * 65 + "\n")
    return stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill India job eligibility")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes to database (default is dry-run mode)",
    )
    args = parser.parse_args()
    run_backfill(dry_run=not args.apply)
