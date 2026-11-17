"""
Safe backfill script for job dates.
- Identifies records whose postedAt was incorrectly assigned ingestion/today timestamps
- Sets firstSeenAt and lastSeenAt properly
- Supports --dry-run (default) and --apply modes
- Runs in database transactions
"""

import argparse
import logging
from datetime import datetime, timezone
from database.connection import get_db_connection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# The abhayclasher/internships-india repository was published in March 2026
GITHUB_INDIA_ORIGINAL_DATE = datetime(2026, 3, 8, 14, 30, 0, tzinfo=timezone.utc)

def backfill(dry_run: bool = True):
    logger.info("Starting date backfill audit (dry_run=%s)", dry_run)
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # 1. Total jobs audit
            cur.execute('SELECT count(*) as count FROM jobs')
            total_jobs = cur.fetchone()["count"]

            # 2. Check GitHub India Internships jobs with fabricated 2026-11-17 dates
            cur.execute("""
                SELECT j.id, j.title, j."postedAt", j."createdAt", s.name
                FROM jobs j
                JOIN sources s ON j."sourceId" = s.id
                WHERE s.name = 'GitHub India Internships'
                  AND j."postedAt" >= '2026-11-17 00:00:00+00'
            """)
            gh_jobs = cur.fetchall()

            # 3. Check records with null firstSeenAt or lastSeenAt
            cur.execute("""
                SELECT count(*) as count FROM jobs
                WHERE "firstSeenAt" IS NULL OR "lastSeenAt" IS NULL
            """)
            missing_seen = cur.fetchone()["count"]

            # 4. Check date distribution among active verified Indian jobs
            cur.execute("""
                SELECT 
                    count(*) FILTER (WHERE "postedAt" >= NOW() - INTERVAL '30 days') as within_30d,
                    count(*) FILTER (WHERE "postedAt" < NOW() - INTERVAL '30 days') as older_30d,
                    count(*) FILTER (WHERE "postedAt" IS NULL) as null_posted
                FROM jobs
                WHERE status = 'ACTIVE' AND "indiaEligibility" = 'VERIFIED_INDIAN'
            """)
            row = cur.fetchone()
            before_30d, before_older, before_null = row["within_30d"], row["older_30d"], row["null_posted"]

            logger.info("=== AUDIT SUMMARY ===")
            logger.info("Total jobs in database: %d", total_jobs)
            logger.info("GitHub India Internships jobs with fabricated 2026-11-17 dates: %d", len(gh_jobs))
            logger.info("Jobs missing firstSeenAt/lastSeenAt: %d", missing_seen)
            logger.info("Verified Indian Active Jobs before backfill:")
            logger.info("  <= 30 days: %d", before_30d)
            logger.info("  > 30 days: %d", before_older)
            logger.info("  NULL date: %d", before_null)

            if dry_run:
                logger.info("[DRY RUN] No database changes committed. Run with --apply to execute updates.")
                return

            # Apply updates in transaction
            logger.info("Applying updates...")
            
            # Update GitHub India Internships jobs to their true March 2026 date
            cur.execute("""
                UPDATE jobs
                SET "postedAt" = %s,
                    "updatedAt" = NOW()
                WHERE "sourceId" IN (SELECT id FROM sources WHERE name = 'GitHub India Internships')
                  AND "postedAt" >= '2026-11-17 00:00:00+00'
            """, (GITHUB_INDIA_ORIGINAL_DATE,))
            gh_updated = cur.rowcount
            logger.info("Corrected %d GitHub India Internships jobs to true original date (%s)", gh_updated, GITHUB_INDIA_ORIGINAL_DATE)

            # Ensure firstSeenAt = createdAt and lastSeenAt = updatedAt where null
            cur.execute("""
                UPDATE jobs
                SET "firstSeenAt" = COALESCE("firstSeenAt", "createdAt"),
                    "lastSeenAt" = COALESCE("lastSeenAt", "updatedAt")
                WHERE "firstSeenAt" IS NULL OR "lastSeenAt" IS NULL
            """)
            seen_updated = cur.rowcount
            logger.info("Backfilled firstSeenAt/lastSeenAt for %d jobs", seen_updated)

            # After backfill check
            cur.execute("""
                SELECT 
                    count(*) FILTER (WHERE "postedAt" >= NOW() - INTERVAL '30 days') as within_30d,
                    count(*) FILTER (WHERE "postedAt" < NOW() - INTERVAL '30 days') as older_30d,
                    count(*) FILTER (WHERE "postedAt" IS NULL) as null_posted
                FROM jobs
                WHERE status = 'ACTIVE' AND "indiaEligibility" = 'VERIFIED_INDIAN'
            """)
            row = cur.fetchone()
            after_30d, after_older, after_null = row["within_30d"], row["older_30d"], row["null_posted"]
            
            conn.commit()
            logger.info("=== POST-APPLY VERIFIED INDIAN JOBS ===")
            logger.info("  <= 30 days (FRESH / RECENT): %d", after_30d)
            logger.info("  > 30 days (STALE - preserved in DB, excluded from default newest feed): %d", after_older)
            logger.info("  NULL date: %d", after_null)
            logger.info("Transaction successfully committed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill job dates in database")
    parser.add_argument("--apply", action="store_true", help="Apply changes (default is dry-run)")
    args = parser.parse_args()
    backfill(dry_run=not args.apply)
