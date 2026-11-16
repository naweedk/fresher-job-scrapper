"""
Validation rules for Gemini JSON output.
Ensures enums match Prisma schema, confidence is bounded, and mandatory fields exist.
"""

import json
import logging
from typing import Any, Dict, Optional, Tuple
from schemas import (
    ClassificationResult,
    ClassificationStatusEnum,
    ExperienceLevelEnum,
    JobTypeEnum,
    WorkModeEnum,
)

logger = logging.getLogger(__name__)

CANONICAL_ROLES = {
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Mobile Developer",
    "Data Analyst",
    "Data Scientist",
    "Machine Learning Engineer",
    "AI Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "UI/UX Designer",
    "Product Analyst",
    "Business Analyst",
    "Digital Marketing",
    "Sales",
    "Customer Support",
    "Other",
}


def parse_and_validate_gemini_json(
    raw_response: str,
    model_name: str,
    prompt_version: str,
) -> Tuple[Optional[ClassificationResult], Optional[str]]:
    """
    Parse raw string from Gemini, validate structure and constraints.
    Returns (ClassificationResult, error_message).
    """
    if not raw_response:
        return None, "Empty response from model"

    # Clean code fences if returned by model
    clean_text = raw_response.strip()
    if clean_text.startswith("```json"):
        clean_text = clean_text[7:]
    elif clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    clean_text = clean_text.strip()

    try:
        data: Dict[str, Any] = json.loads(clean_text)
    except Exception as e:
        return None, f"Failed to parse JSON: {e}"

    # Validate enums with graceful fallbacks
    # jobType
    raw_job_type = data.get("jobType") or data.get("job_type")
    job_type = None
    if raw_job_type:
        try:
            job_type = JobTypeEnum(str(raw_job_type).upper())
        except ValueError:
            job_type = JobTypeEnum.OTHER

    # experienceLevel
    raw_exp = data.get("experienceLevel") or data.get("experience_level")
    experience_level = None
    if raw_exp:
        try:
            experience_level = ExperienceLevelEnum(str(raw_exp).upper())
        except ValueError:
            experience_level = ExperienceLevelEnum.OTHER

    # workMode
    raw_wm = data.get("workMode") or data.get("work_mode")
    work_mode = WorkModeEnum.UNKNOWN
    if raw_wm:
        try:
            work_mode = WorkModeEnum(str(raw_wm).upper())
        except ValueError:
            work_mode = WorkModeEnum.UNKNOWN

    # role
    role = data.get("role")
    if role and role not in CANONICAL_ROLES:
        # Match closest or fallback to Other
        role = "Other"

    # confidence
    confidence = data.get("confidence", 0.5)
    try:
        confidence = float(confidence)
        confidence = max(0.0, min(1.0, confidence))
    except (ValueError, TypeError):
        confidence = 0.5

    # skills
    raw_skills = data.get("skills", [])
    skills = [str(s).strip() for s in raw_skills if str(s).strip()][:10] if isinstance(raw_skills, list) else []

    city = data.get("city")
    if city and str(city).lower() in ("null", "none", "unknown"):
        city = None

    result = ClassificationResult(
        role=role,
        city=city,
        job_type=job_type,
        experience_level=experience_level,
        work_mode=work_mode,
        skills=skills,
        confidence=confidence,
        model_name=model_name,
        prompt_version=prompt_version,
        status=ClassificationStatusEnum.COMPLETED,
    )
    return result, None
