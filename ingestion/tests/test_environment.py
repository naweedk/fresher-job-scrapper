"""
test_environment.py

Basic smoke tests verifying that the Python ingestion environment
is correctly configured and all required packages are importable.
"""

import sys


def test_python_version():
    """Ensure Python 3.11 or newer is in use."""
    assert sys.version_info >= (3, 11), (
        f"Python 3.11+ required, got {sys.version}"
    )


def test_httpx_importable():
    import httpx  # noqa: F401


def test_requests_importable():
    import requests  # noqa: F401


def test_beautifulsoup_importable():
    import bs4  # noqa: F401


def test_pydantic_importable():
    import pydantic  # noqa: F401


def test_dotenv_importable():
    import dotenv  # noqa: F401


def test_psycopg_importable():
    import psycopg  # noqa: F401


def test_settings_loads():
    """
    Verify that the Settings class initialises without errors.
    Uses default values so no .env file is required in CI.
    """
    import sys
    import os

    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    from config import get_settings

    settings = get_settings()
    assert settings.environment is not None
    assert settings.log_level is not None
    assert settings.database_url.startswith("postgresql")


def test_database_url_display_masks_password():
    """Verify that the display URL hides the password."""
    import sys
    import os

    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    from config import Settings

    s = Settings(DATABASE_URL="postgresql://user:secret123@localhost:5432/db")
    assert "secret123" not in s.database_url_display
    assert "***" in s.database_url_display
