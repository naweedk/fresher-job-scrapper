"""
Fresher Jobs India — Python Ingestion Entry Point

This module initialises the ingestion environment and verifies
configuration before any collection or processing begins.

Usage:
    python main.py
"""

from config import get_settings


def main() -> None:
    settings = get_settings()

    print("=" * 60)
    print("  Fresher Jobs India — Ingestion Service")
    print("=" * 60)
    print(f"  Environment  : {settings.environment}")
    print(f"  Log level    : {settings.log_level}")
    print(f"  Database     : {settings.database_url_display}")
    print("=" * 60)
    print()
    print("  Phase 1 — Development environment ready.")
    print("  Job collection and AI classification are planned for Phase 2.")
    print()


if __name__ == "__main__":
    main()
