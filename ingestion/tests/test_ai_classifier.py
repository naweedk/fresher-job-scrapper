"""
Unit tests for GeminiClassifier and usage metrics with mocked Gemini responses.
"""

from unittest.mock import MagicMock, patch
import pytest
from processors.ai_classifier import GeminiClassifier
from schemas import (
    ClassificationResult,
    ClassificationStatusEnum,
    ExperienceLevelEnum,
    JobTypeEnum,
    UsageMetadata,
    WorkModeEnum,
)


def test_usage_metadata_calculation():
    usage = UsageMetadata(
        model_name="gemini-2.5-flash",
        prompt_version="job-classification-v1",
        input_tokens=1_000_000,
        output_tokens=500_000,
        successful_count=1000,
    )
    # $0.15/1M input + $0.60/1M output * 0.5 = $0.15 + $0.30 = $0.45
    cost = usage.calculate_cost(input_price_per_m=0.15, output_price_per_m=0.60)
    assert pytest.approx(cost, 0.001) == 0.45
    assert pytest.approx(usage.cost_per_1000_jobs, 0.001) == 0.45


def test_classifier_gracefully_reports_unavailable_without_key():
    classifier = GeminiClassifier(api_key="")
    assert classifier.is_available is False
    res, err = classifier.classify_job({"title": "Dev"})
    assert res is None
    assert "not configured" in err


def test_classifier_parses_mocked_gemini_response():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = """
    {
      "role": "Backend Developer",
      "city": "Hyderabad",
      "jobType": "FULL_TIME",
      "experienceLevel": "FRESHER",
      "workMode": "ONSITE",
      "skills": ["Python", "Django", "PostgreSQL"],
      "confidence": 0.92
    }
    """
    mock_response.usage_metadata.prompt_token_count = 350
    mock_response.usage_metadata.candidates_token_count = 60

    mock_client.models.generate_content.return_value = mock_response

    classifier = GeminiClassifier(api_key="mock_key")
    classifier._client = mock_client

    sample_job = {
        "title": "Junior Python Developer",
        "company_name": "Tech Corp",
        "location": "Hyderabad",
        "description": "Looking for fresh graduates with strong Python foundation.",
    }

    result, err = classifier.classify_job(sample_job)

    assert err is None
    assert isinstance(result, ClassificationResult)
    assert result.role == "Backend Developer"
    assert result.city == "Hyderabad"
    assert result.job_type == JobTypeEnum.FULL_TIME
    assert result.experience_level == ExperienceLevelEnum.FRESHER
    assert result.work_mode == WorkModeEnum.ONSITE
    assert result.confidence == 0.92
    assert "Django" in result.skills
    assert classifier.usage.requests_count == 1
    assert classifier.usage.successful_count == 1
    assert classifier.usage.input_tokens == 350
    assert classifier.usage.output_tokens == 60
    assert classifier.usage.total_tokens == 410
