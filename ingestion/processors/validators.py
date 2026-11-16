"""
Validation rules for raw collected jobs.
Rejects incomplete, invalid, or malformed entries with clear reasons.
"""

from typing import Tuple
from urllib.parse import urlparse
from schemas import RawJob


def validate_raw_job(raw: RawJob) -> Tuple[bool, str]:
    """
    Validate that a raw job has the minimum required fields to constitute
    a valid listing.
    
    Returns (is_valid, rejection_reason).
    """
    if not raw.title or len(raw.title.strip()) < 3:
        return False, "Job title is missing or too short (< 3 chars)"

    if not raw.company_name or len(raw.company_name.strip()) < 2:
        return False, "Company name is missing or too short (< 2 chars)"

    if not raw.job_url or len(raw.job_url.strip()) < 8:
        return False, "Job URL is missing or too short"

    try:
        parsed = urlparse(raw.job_url.strip())
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return False, f"Job URL is invalid: {raw.job_url}"
    except Exception as e:
        return False, f"Failed to parse job URL: {e}"

    if not raw.description or len(raw.description.strip()) < 20:
        return False, "Description is missing or too short (< 20 chars)"

    return True, ""
