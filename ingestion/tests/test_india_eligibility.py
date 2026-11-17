"""
Unit tests for India location and work-mode eligibility processor.
Verifies all 12 required test cases from the specification.
"""

import pytest
from processors.india_eligibility import evaluate_india_eligibility
from schemas import IndiaEligibilityEnum, WorkModeEnum


@pytest.mark.parametrize(
    "listing_text,expected_eligibility,expected_work_mode",
    [
        ("Mumbai - Onsite", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.ONSITE),
        ("Pune - Hybrid", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.HYBRID),
        ("Bengaluru - Onsite", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.ONSITE),
        ("Hyderabad - Hybrid", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.HYBRID),
        ("Remote - India", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.REMOTE),
        ("Remote within India", IndiaEligibilityEnum.VERIFIED_INDIAN, WorkModeEnum.REMOTE),
        ("Remote - US only", IndiaEligibilityEnum.INTERNATIONAL, WorkModeEnum.REMOTE),
        ("London - Onsite", IndiaEligibilityEnum.INTERNATIONAL, WorkModeEnum.ONSITE),
        ("Canada - Remote", IndiaEligibilityEnum.INTERNATIONAL, WorkModeEnum.REMOTE),
        (
            "Worldwide Remote without India confirmation",
            IndiaEligibilityEnum.AMBIGUOUS,
            WorkModeEnum.REMOTE,
        ),
        (
            "Remote with unknown eligibility",
            IndiaEligibilityEnum.AMBIGUOUS,
            WorkModeEnum.REMOTE,
        ),
        ("", IndiaEligibilityEnum.AMBIGUOUS, WorkModeEnum.UNKNOWN),  # Missing location
    ],
)
def test_specification_required_test_cases(listing_text, expected_eligibility, expected_work_mode):
    result = evaluate_india_eligibility(location=listing_text)
    assert (
        result.eligibility == expected_eligibility
    ), f"Failed eligibility for '{listing_text}': got {result.eligibility}, expected {expected_eligibility}"
    assert (
        result.work_mode == expected_work_mode
    ), f"Failed work mode for '{listing_text}': got {result.work_mode}, expected {expected_work_mode}"


def test_city_normalization():
    # Bangalore -> Bengaluru
    res1 = evaluate_india_eligibility("Bangalore - Onsite")
    assert res1.eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN
    assert res1.city == "Bengaluru"
    assert res1.country_code == "IN"

    # Bombay -> Mumbai
    res2 = evaluate_india_eligibility("Bombay - Hybrid")
    assert res2.eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN
    assert res2.city == "Mumbai"
    assert res2.work_mode == WorkModeEnum.HYBRID

    # Gurgaon -> Gurugram
    res3 = evaluate_india_eligibility("Gurgaon")
    assert res3.eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN
    assert res3.city == "Gurugram"


def test_indiana_indianapolis_not_confused_with_india():
    res = evaluate_india_eligibility("Indianapolis, IN")
    assert res.eligibility == IndiaEligibilityEnum.INTERNATIONAL
    assert res.country_code == "US"


def test_remote_with_india_in_description():
    res = evaluate_india_eligibility(
        location="Remote",
        title="Frontend Engineer",
        description="We are hiring developers residing in India for this remote role.",
    )
    assert res.eligibility == IndiaEligibilityEnum.VERIFIED_INDIAN
    assert res.work_mode == WorkModeEnum.REMOTE
    assert res.country_code == "IN"
