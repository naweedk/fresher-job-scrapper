"""
Pydantic schemas for the data ingestion and processing pipeline.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


class SourceTypeEnum(str, Enum):
    API = "API"
    RSS = "RSS"
    HTML = "HTML"
    OTHER = "OTHER"


class JobStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    INACTIVE = "INACTIVE"


class JobTypeEnum(str, Enum):
    INTERNSHIP = "INTERNSHIP"
    FULL_TIME = "FULL_TIME"
    CONTRACT = "CONTRACT"
    OTHER = "OTHER"


class ExperienceLevelEnum(str, Enum):
    FRESHER = "FRESHER"
    ZERO_TO_ONE_YEAR = "ZERO_TO_ONE_YEAR"
    ONE_TO_TWO_YEARS = "ONE_TO_TWO_YEARS"
    OTHER = "OTHER"


class WorkModeEnum(str, Enum):
    ONSITE = "ONSITE"
    REMOTE = "REMOTE"
    HYBRID = "HYBRID"
    UNKNOWN = "UNKNOWN"


class ClassificationStatusEnum(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class RawJob(BaseModel):
    """Raw job payload produced by source collectors."""
    source_name: str
    external_id: Optional[str] = None
    title: str
    company_name: str
    description: str
    job_url: str
    location: Optional[str] = None
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    company_url: Optional[str] = None
    company_logo: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class NormalizedJob(BaseModel):
    """Normalized, deduplication-ready job record."""
    source_id: str
    external_id: Optional[str] = None
    title: str
    company_name: str
    description: str
    location: Optional[str] = None
    job_url: str
    canonical_url: str
    content_hash: str
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    status: JobStatusEnum = JobStatusEnum.ACTIVE
    company_url: Optional[str] = None
    company_logo: Optional[str] = None


class ClassificationResult(BaseModel):
    """Structured response validated from Google Gemini LLM."""
    role: Optional[str] = None
    city: Optional[str] = None
    job_type: Optional[JobTypeEnum] = None
    experience_level: Optional[ExperienceLevelEnum] = None
    work_mode: Optional[WorkModeEnum] = WorkModeEnum.UNKNOWN
    skills: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    model_name: Optional[str] = None
    prompt_version: Optional[str] = None
    status: ClassificationStatusEnum = ClassificationStatusEnum.COMPLETED


class UsageMetadata(BaseModel):
    """Tracks token consumption and API costs for Gemini calls."""
    model_name: str
    prompt_version: str
    requests_count: int = 0
    successful_count: int = 0
    failed_count: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0

    def calculate_cost(self, input_price_per_m: float = 0.15, output_price_per_m: float = 0.60):
        """
        Calculate estimated cost based on per-million token pricing.
        Default rates for Gemini 2.5 Flash: $0.15/1M input, $0.60/1M output.
        """
        self.estimated_cost_usd = (
            (self.input_tokens / 1_000_000.0 * input_price_per_m)
            + (self.output_tokens / 1_000_000.0 * output_price_per_m)
        )
        return self.estimated_cost_usd

    @property
    def cost_per_1000_jobs(self) -> float:
        if self.successful_count == 0:
            return 0.0
        return (self.estimated_cost_usd / self.successful_count) * 1000.0
