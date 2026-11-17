"""
Unit tests for source collectors and collector registry.
"""

from unittest.mock import MagicMock, patch
import pytest

from collectors import COLLECTOR_REGISTRY, get_all_collectors, get_collector
from collectors.github_india import GitHubIndiaInternshipsCollector
from collectors.greenhouse import GreenhouseCollector
from collectors.lever import LeverCollector
from collectors.jobicy import JobicyCollector
from collectors.naukri import NaukriCollector
from schemas import RawJob


def test_collector_registry_has_all_expected_sources():
    expected_sources = [
        "arbeitnow",
        "remotive",
        "remoteok",
        "hasjob",
        "simplify_jobs",
        "greenhouse",
        "lever",
        "github_india",
        "jobicy",
        "naukri",
    ]
    for src in expected_sources:
        assert src in COLLECTOR_REGISTRY, f"Expected '{src}' in COLLECTOR_REGISTRY"
        collector = get_collector(src)
        assert collector is not None
        assert collector.name != ""


def test_naukri_optional_collector_skips_cleanly_without_credentials():
    collector = NaukriCollector()
    collector.is_configured = False
    jobs = collector.fetch_jobs()
    assert jobs == []


def test_greenhouse_collector_parses_job_payload():
    collector = GreenhouseCollector(companies=["testco"])
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "jobs": [
            {
                "id": 12345,
                "title": "Graduate Engineer Trainee",
                "location": {"name": "Bengaluru, India"},
                "absolute_url": "https://boards.greenhouse.io/testco/jobs/12345",
                "content": "<p>Entry level role for 2025/2026 graduates</p>",
                "updated_at": "2026-11-15T10:00:00Z",
            }
        ]
    }

    with patch.object(collector, "get_http_client") as mock_client_factory:
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_client_factory.return_value = mock_client

        jobs = collector.fetch_jobs(max_pages=1)
        assert len(jobs) == 1
        assert jobs[0].title == "Graduate Engineer Trainee"
        assert jobs[0].location == "Bengaluru, India"
        assert jobs[0].company_name == "Testco"
        assert jobs[0].job_url == "https://boards.greenhouse.io/testco/jobs/12345"


def test_lever_collector_parses_job_payload():
    collector = LeverCollector(companies=["testlever"])
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {
            "id": "lever-123",
            "text": "Associate Software Engineer",
            "hostedUrl": "https://jobs.lever.co/testlever/lever-123",
            "categories": {"location": "Bengaluru", "team": "Engineering", "commitment": "Full Time"},
            "descriptionPlain": "Entry level engineer position in Bangalore",
            "createdAt": 1731664800000,
        }
    ]

    with patch.object(collector, "get_http_client") as mock_client_factory:
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_client_factory.return_value = mock_client

        jobs = collector.fetch_jobs(max_pages=1)
        assert len(jobs) == 1
        assert jobs[0].title == "Associate Software Engineer"
        assert jobs[0].location == "Bengaluru"
        assert jobs[0].company_name == "Testlever"


def test_jobicy_collector_parses_job_payload():
    collector = JobicyCollector()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "jobs": [
            {
                "id": "jobicy-999",
                "jobTitle": "Junior React Developer",
                "companyName": "TechCorp",
                "jobDescription": "Remote junior developer role open to India",
                "url": "https://jobicy.com/jobs/999",
                "jobGeo": "India",
                "pubDate": "2026-11-16T12:00:00Z",
            }
        ]
    }

    with patch.object(collector, "get_http_client") as mock_client_factory:
        mock_client = MagicMock()
        mock_client.get.return_value = mock_response
        mock_client_factory.return_value = mock_client

        jobs = collector.fetch_jobs(max_pages=1)
        assert len(jobs) == 1
        assert jobs[0].title == "Junior React Developer"
        assert jobs[0].company_name == "TechCorp"
        assert jobs[0].location == "India"
