"""
Ingestion service configuration.

Reads environment variables from .env and validates them using Pydantic Settings.
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
        default="postgresql://postgres:local_dev_password@localhost:5434/fresher_jobs",
        alias="DATABASE_URL",
    )

    # ── AI / LLM ─────────────────────────────────────────────
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL")

    # ── Application & Logging ────────────────────────────────
    environment: str = Field(default="development", alias="NODE_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # ── Ingestion Pipeline Controls ──────────────────────────
    ingestion_batch_size: int = Field(default=50, alias="INGESTION_BATCH_SIZE")
    ingestion_request_timeout: float = Field(default=30.0, alias="INGESTION_REQUEST_TIMEOUT")
    ingestion_max_retries: int = Field(default=3, alias="INGESTION_MAX_RETRIES")
    ingestion_rate_limit_delay: float = Field(default=1.0, alias="INGESTION_RATE_LIMIT_DELAY")
    ingestion_max_pages: int = Field(default=5, alias="INGESTION_MAX_PAGES")

    # ── Classification Pipeline Controls ─────────────────────
    classification_batch_size: int = Field(default=20, alias="CLASSIFICATION_BATCH_SIZE")
    classification_max_retries: int = Field(default=3, alias="CLASSIFICATION_MAX_RETRIES")
    classification_confidence_threshold: float = Field(default=0.70, alias="CLASSIFICATION_CONFIDENCE_THRESHOLD")

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
