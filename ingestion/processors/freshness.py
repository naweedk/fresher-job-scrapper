"""
Freshness validation layer for jobs.
Determines freshness status based on genuine source publication timestamp:
- FRESH: verified posting date within 7 days.
- RECENT: verified posting date within 8–30 days.
- STALE: older than 30 days.
- UNKNOWN: no trustworthy posting date.
- FUTURE: invalid future date.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class FreshnessStatus(str, Enum):
    FRESH = "FRESH"          # <= 7 days
    RECENT = "RECENT"        # 8–30 days
    STALE = "STALE"          # > 30 days
    UNKNOWN = "UNKNOWN"      # missing or unverifiable
    FUTURE = "FUTURE"        # timestamp in the future


def evaluate_job_freshness(
    posted_at: Optional[datetime],
    reference_time: Optional[datetime] = None,
    max_recent_days: int = 30,
) -> FreshnessStatus:
    """
    Evaluates the freshness of a job posting based on its authentic posted_at date.
    """
    if not posted_at:
        return FreshnessStatus.UNKNOWN

    now = reference_time or datetime.now(timezone.utc)
    if posted_at.tzinfo is None:
        posted_at = posted_at.replace(tzinfo=timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    # Difference in days
    diff = now - posted_at
    total_seconds = diff.total_seconds()

    # Reject future timestamps (allowing 5 minute clock drift)
    if total_seconds < -300:
        return FreshnessStatus.FUTURE

    days = total_seconds / 86400.0

    if days <= 7.0:
        return FreshnessStatus.FRESH
    elif days <= float(max_recent_days):
        return FreshnessStatus.RECENT
    else:
        return FreshnessStatus.STALE


def is_feed_eligible(
    posted_at: Optional[datetime],
    max_age_days: int = 30,
    reference_time: Optional[datetime] = None,
) -> bool:
    """
    Returns True if the job satisfies default public feed freshness requirements:
    Verified posting date within the configured maximum age (default 30 days).
    """
    status = evaluate_job_freshness(posted_at, reference_time=reference_time, max_recent_days=max_age_days)
    return status in (FreshnessStatus.FRESH, FreshnessStatus.RECENT)
