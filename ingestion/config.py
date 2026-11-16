"""
Ingestion service configuration.

Reads environment variables from .env (via python-dotenv) and
validates them using Pydantic Settings.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ─────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql://postgres:local_dev_password@localhost:5432/fresher_jobs",
        alias="DATABASE_URL",
    )

    # ── AI / LLM ─────────────────────────────────────────────
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")

    # ── Application ──────────────────────────────────────────
    environment: str = Field(default="development", alias="NODE_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @property
    def database_url_display(self) -> str:
        """Return the database URL with the password masked."""
        try:
            from urllib.parse import urlparse, urlunparse

            parsed = urlparse(self.database_url)
            if parsed.password:
                masked = parsed._replace(
                    netloc=parsed.netloc.replace(parsed.password, "***")
                )
                return urlunparse(masked)
        except Exception:
            pass
        return self.database_url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
