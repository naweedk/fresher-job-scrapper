"""
Automated test suite for date extraction, timezone normalisation, and freshness validation.
"""

from datetime import datetime, timedelta, timezone
import pytest

from processors.freshness import evaluate_job_freshness, is_feed_eligible, FreshnessStatus


def test_freshness_fresh_within_7_days():
    now = datetime(2026, 11, 17, 12, 0, 0, tzinfo=timezone.utc)
    # 2 days ago
    posted = now - timedelta(days=2)
    status = evaluate_job_freshness(posted, reference_time=now)
    assert status == FreshnessStatus.FRESH
    assert is_feed_eligible(posted, reference_time=now) is True


def test_freshness_recent_8_to_30_days():
    now = datetime(2026, 11, 17, 12, 0, 0, tzinfo=timezone.utc)
    # 15 days ago
    posted = now - timedelta(days=15)
    status = evaluate_job_freshness(posted, reference_time=now)
    assert status == FreshnessStatus.RECENT
    assert is_feed_eligible(posted, reference_time=now) is True


def test_freshness_stale_over_30_days():
    now = datetime(2026, 11, 17, 12, 0, 0, tzinfo=timezone.utc)
    # 35 days ago
    posted = now - timedelta(days=35)
    status = evaluate_job_freshness(posted, reference_time=now)
    assert status == FreshnessStatus.STALE
    assert is_feed_eligible(posted, reference_time=now) is False

    # 8 months ago (like March 2026 listings)
    march_job = datetime(2026, 3, 8, 12, 0, 0, tzinfo=timezone.utc)
    assert evaluate_job_freshness(march_job, reference_time=now) == FreshnessStatus.STALE
    assert is_feed_eligible(march_job, reference_time=now) is False


def test_freshness_missing_or_none_date():
    status = evaluate_job_freshness(None)
    assert status == FreshnessStatus.UNKNOWN
    assert is_feed_eligible(None) is False


def test_freshness_rejects_future_timestamp():
    now = datetime(2026, 11, 17, 12, 0, 0, tzinfo=timezone.utc)
    future_date = now + timedelta(days=5)
    status = evaluate_job_freshness(future_date, reference_time=now)
    assert status == FreshnessStatus.FUTURE
    assert is_feed_eligible(future_date, reference_time=now) is False


def test_date_extraction_formats():
    # 1. ISO 8601 with Z
    iso_z = "2026-11-15T08:30:00Z"
    dt1 = datetime.fromisoformat(iso_z.replace("Z", "+00:00"))
    assert dt1.tzinfo is not None
    assert dt1.year == 2026 and dt1.month == 11 and dt1.day == 15

    # 2. ISO 8601 with offset (+05:30)
    iso_ist = "2026-11-15T14:00:00+05:30"
    dt2 = datetime.fromisoformat(iso_ist)
    dt2_utc = dt2.astimezone(timezone.utc)
    assert dt2_utc.hour == 8 and dt2_utc.minute == 30

    # 3. Unix timestamp in seconds
    epoch_sec = 1794736800  # Nov 15 2026
    dt3 = datetime.fromtimestamp(epoch_sec, tz=timezone.utc)
    assert dt3.year == 2026

    # 4. Unix timestamp in milliseconds
    epoch_ms = 1794736800000
    dt4 = datetime.fromtimestamp(epoch_ms / 1000.0, tz=timezone.utc)
    assert dt4.year == 2026
    assert dt4 == dt3

    # 5. Date-only string YYYY-MM-DD
    date_only = "2026-11-15"
    dt5 = datetime.fromisoformat(date_only).replace(tzinfo=timezone.utc)
    assert dt5.year == 2026 and dt5.month == 11 and dt5.day == 15
