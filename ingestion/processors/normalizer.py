"""
Data normalizer for converting RawJob instances into NormalizedJob instances.
Strips HTML, standardizes whitespace, parses dates, normalizes locations and titles.
"""

import html
import re
from datetime import datetime, timezone
from bs4 import BeautifulSoup

from processors.content_hasher import generate_content_hash
from processors.india_eligibility import evaluate_india_eligibility
from processors.url_normalizer import normalize_url
from schemas import NormalizedJob, RawJob


# Known location standardizations for Indian and global tech hubs
LOCATION_MAP = {
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "bombay": "Mumbai",
    "mumbai": "Mumbai",
    "gurgaon": "Gurugram",
    "gurugram": "Gurugram",
    "delhi": "Delhi",
    "new delhi": "Delhi",
    "noida": "Noida",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "chennai": "Chennai",
    "madras": "Chennai",
    "calcutta": "Kolkata",
    "kolkata": "Kolkata",
    "ahmedabad": "Ahmedabad",
    "jaipur": "Jaipur",
    "remote": "Remote",
    "work from home": "Remote",
    "anywhere in the world": "Remote",
    "worldwide": "Remote",
    "remote - india": "Remote (India)",
}


def clean_html(raw_html: str) -> str:
    """Strip HTML markup, decode entities, and normalize whitespace."""
    if not raw_html:
        return ""
    # Quick unescape
    unescaped = html.unescape(raw_html)
    # Use BeautifulSoup with standard html.parser
    soup = BeautifulSoup(unescaped, "html.parser")
    text = soup.get_text(separator=" ")
    # Normalize multiple whitespaces
    clean = re.sub(r"\s+", " ", text).strip()
    return clean


def normalize_title(title: str) -> str:
    """Normalize whitespace and remove distracting formatting artifacts."""
    if not title:
        return ""
    t = html.unescape(title)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def normalize_company_name(name: str) -> str:
    """Trim whitespace and standardize company names."""
    if not name:
        return ""
    c = html.unescape(name)
    c = re.sub(r"\s+", " ", c).strip()
    return c


def normalize_location(location: str | None) -> str | None:
    """Map known Indian aliases to official city names while preserving original context."""
    if not location:
        return None
    loc_clean = re.sub(r"\s+", " ", location).strip()
    loc_lower = loc_clean.lower()

    for pattern, canonical in LOCATION_MAP.items():
        if pattern in loc_lower:
            return canonical

    return loc_clean


def normalize_job(raw: RawJob, source_id: str) -> NormalizedJob:
    """Convert a validated RawJob to a clean NormalizedJob."""
    clean_desc = clean_html(raw.description)
    clean_title = normalize_title(raw.title)
    clean_company = normalize_company_name(raw.company_name)
    clean_loc = normalize_location(raw.location)
    canonical = normalize_url(raw.job_url)

    content_hash = generate_content_hash(
        title=clean_title,
        company_name=clean_company,
        location=clean_loc,
        description=clean_desc,
    )

    posted_at = raw.posted_at
    if posted_at and posted_at.tzinfo is None:
        posted_at = posted_at.replace(tzinfo=timezone.utc)

    source_updated_at = raw.source_updated_at
    if source_updated_at and source_updated_at.tzinfo is None:
        source_updated_at = source_updated_at.replace(tzinfo=timezone.utc)

    # Evaluate India location and work-mode eligibility
    india_res = evaluate_india_eligibility(
        location=clean_loc,
        title=clean_title,
        description=clean_desc,
    )

    final_loc = india_res.city if india_res.city else clean_loc

    return NormalizedJob(
        source_id=source_id,
        external_id=raw.external_id,
        title=clean_title,
        company_name=clean_company,
        description=clean_desc,
        location=final_loc,
        job_url=raw.job_url,
        canonical_url=canonical,
        content_hash=content_hash,
        posted_at=posted_at,
        source_updated_at=source_updated_at,
        expires_at=raw.expires_at,
        company_url=raw.company_url,
        company_logo=raw.company_logo,
        country_code=india_res.country_code,
        work_mode=india_res.work_mode,
        india_eligibility=india_res.eligibility,
        remote_eligibility_scope=india_res.remote_scope,
    )
