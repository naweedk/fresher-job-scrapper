"""
Unit and integration test suite for Phase 2 data ingestion, deduplication, and AI validation.
"""

from datetime import datetime, timezone
import pytest
from processors.content_hasher import generate_content_hash
from processors.eligibility import check_fresher_eligibility
from processors.normalizer import clean_html, normalize_job, normalize_location, normalize_title
from processors.url_normalizer import normalize_url
from processors.validators import validate_raw_job
from processors.classification_validator import parse_and_validate_gemini_json
from schemas import (
    ClassificationResult,
    ClassificationStatusEnum,
    ExperienceLevelEnum,
    JobTypeEnum,
    NormalizedJob,
    RawJob,
    WorkModeEnum,
)


# ── URL Normalization Tests ─────────────────────────────────

def test_url_normalization_strips_utm_and_tracking():
    raw_url = "https://example.com/jobs/123/?utm_source=linkedin&utm_medium=cpc&ref=affiliate#apply"
    canonical = normalize_url(raw_url)
    assert "utm_source" not in canonical
    assert "utm_medium" not in canonical
    assert "ref" not in canonical
    assert "#apply" not in canonical
    assert canonical == "https://example.com/jobs/123"


def test_url_normalization_preserves_legitimate_query_params():
    url = "https://boards.greenhouse.io/company/jobs?gh_jid=45678&utm_campaign=spring"
    canonical = normalize_url(url)
    assert "gh_jid=45678" in canonical
    assert "utm_campaign" not in canonical


# ── Content Hashing Tests ───────────────────────────────────

def test_content_hashing_deterministic():
    hash1 = generate_content_hash(
        title="Junior Software Engineer",
        company_name="Acme Corp",
        location="Bengaluru",
        description="Looking for recent grads with Python experience.",
    )
    hash2 = generate_content_hash(
        title="junior software engineer",
        company_name="  ACME CORP  ",
        location="Bengaluru",
        description="Looking for recent grads with Python experience.",
    )
    assert hash1 == hash2


def test_content_hashing_different_for_different_jobs():
    hash1 = generate_content_hash("Frontend Intern", "Stripe", "Bengaluru", "React role")
    hash2 = generate_content_hash("Backend Intern", "Stripe", "Bengaluru", "Go role")
    assert hash1 != hash2


# ── HTML Cleaning & Normalization Tests ──────────────────────

def test_clean_html_removes_tags_and_decodes_entities():
    raw_html = "<p>Join our team as a <strong>Frontend Developer</strong> &amp; build UI.</p>"
    clean = clean_html(raw_html)
    assert clean == "Join our team as a Frontend Developer & build UI."


def test_normalize_location_indian_aliases():
    assert normalize_location("Bangalore, India") == "Bengaluru"
    assert normalize_location("bombay") == "Mumbai"
    assert normalize_location("Gurgaon, Haryana") == "Gurugram"
    assert normalize_location("Anywhere in the World") == "Remote"


# ── Raw Job Validation Tests ────────────────────────────────

def test_validate_raw_job_success():
    raw = RawJob(
        source_name="Arbeitnow",
        external_id="test-1",
        title="Junior Python Engineer",
        company_name="Tech Solutions",
        description="A great opportunity for 0-1 year experience developers to learn and grow.",
        job_url="https://example.com/jobs/test-1",
    )
    is_valid, reason = validate_raw_job(raw)
    assert is_valid is True
    assert reason == ""


def test_validate_raw_job_rejects_missing_url():
    raw = RawJob(
        source_name="Arbeitnow",
        title="Junior Python Engineer",
        company_name="Tech Solutions",
        description="Valid description with enough characters for testing.",
        job_url="not-a-valid-url",
    )
    is_valid, reason = validate_raw_job(raw)
    assert is_valid is False
    assert "Job URL is invalid" in reason


# ── Fresher Eligibility Filter Tests ────────────────────────

def test_eligibility_filter_accepts_fresher_and_internships():
    job = NormalizedJob(
        source_id="src-1",
        title="Software Engineering Intern (Summer 2025)",
        company_name="Stripe",
        description="Open to current students and recent graduates.",
        job_url="https://stripe.com/jobs/1",
        canonical_url="https://stripe.com/jobs/1",
        content_hash="abc",
    )
    eligible, reason = check_fresher_eligibility(job)
    assert eligible is True


def test_eligibility_filter_rejects_senior_roles():
    job = NormalizedJob(
        source_id="src-1",
        title="Senior Lead Full Stack Architect",
        company_name="Enterprise Corp",
        description="Requires 7+ years of experience leading teams.",
        job_url="https://example.com/jobs/lead",
        canonical_url="https://example.com/jobs/lead",
        content_hash="def",
    )
    eligible, reason = check_fresher_eligibility(job)
    assert eligible is False
    assert "senior/managerial" in reason


# ── AI Output Validation Tests ──────────────────────────────

def test_parse_and_validate_gemini_json_valid():
    sample_json = """
    {
      "role": "Frontend Developer",
      "city": "Bengaluru",
      "jobType": "FULL_TIME",
      "experienceLevel": "FRESHER",
      "workMode": "HYBRID",
      "skills": ["React", "TypeScript", "Next.js"],
      "confidence": 0.95
    }
    """
    result, err = parse_and_validate_gemini_json(sample_json, "gemini-2.5-flash", "v1")
    assert err is None
    assert isinstance(result, ClassificationResult)
    assert result.role == "Frontend Developer"
    assert result.city == "Bengaluru"
    assert result.job_type == JobTypeEnum.FULL_TIME
    assert result.experience_level == ExperienceLevelEnum.FRESHER
    assert result.work_mode == WorkModeEnum.HYBRID
    assert result.confidence == 0.95
    assert "React" in result.skills


def test_parse_and_validate_gemini_json_handles_code_fences_and_unknown_enums():
    fenced_json = """```json
    {
      "role": "Unknown Custom Title",
      "city": null,
      "jobType": "CO-OP",
      "experienceLevel": "MID_LEVEL",
      "workMode": "ANYWHERE",
      "skills": ["Python"],
      "confidence": 1.5
    }
    ```"""
    result, err = parse_and_validate_gemini_json(fenced_json, "gemini-2.5-flash", "v1")
    assert err is None
    assert result.role == "Other"
    assert result.job_type == JobTypeEnum.OTHER
    assert result.experience_level == ExperienceLevelEnum.OTHER
    assert result.work_mode == WorkModeEnum.UNKNOWN
    assert result.confidence == 1.0  # Clamped to 1.0
