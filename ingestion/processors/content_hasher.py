"""
Content hashing utility for deterministic duplicate detection.
"""

import hashlib
import re


def generate_content_hash(
    title: str,
    company_name: str,
    location: str | None,
    description: str
) -> str:
    """
    Generate a SHA-256 fingerprint for a job listing using normalized fields.
    
    Normalizes whitespace and case to ensure formatting variations don't produce
    divergent hashes for identical listings.
    """
    clean_title = re.sub(r"\s+", " ", (title or "").lower().strip())
    clean_company = re.sub(r"\s+", " ", (company_name or "").lower().strip())
    clean_location = re.sub(r"\s+", " ", (location or "").lower().strip())
    
    # Strip non-alphanumeric noise from description before hashing first 500 chars
    desc_sample = re.sub(r"\s+", " ", (description or "").lower().strip())[:500]

    raw_payload = f"{clean_title}|{clean_company}|{clean_location}|{desc_sample}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()
