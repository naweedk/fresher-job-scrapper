"""
AI Classifier integrating Google Gemini API with fallback, token tracking, and structured output.
"""

import logging
import time
from typing import Dict, Optional, Tuple
from config import get_settings
from processors.classification_prompt import (
    PROMPT_VERSION,
    SYSTEM_INSTRUCTION,
    build_classification_prompt,
)
from processors.classification_validator import parse_and_validate_gemini_json
from schemas import ClassificationResult, ClassificationStatusEnum, UsageMetadata

logger = logging.getLogger(__name__)


class GeminiClassifier:
    """Manages classification calls to Google Gemini API."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        settings = get_settings()
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model_name or settings.gemini_model
        self.prompt_version = PROMPT_VERSION
        self.usage = UsageMetadata(
            model_name=self.model_name,
            prompt_version=self.prompt_version,
        )
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error("Failed to initialize Google GenAI Client: %s", e)

    @property
    def is_available(self) -> bool:
        return self._client is not None and bool(self.api_key)

    def classify_job(
        self,
        job_data: Dict,
        max_retries: int = 3,
    ) -> Tuple[Optional[ClassificationResult], Optional[str]]:
        """
        Send a job listing to Gemini and validate its structured classification.
        Returns (ClassificationResult, error_message).
        """
        if not self.is_available:
            return None, "Gemini API key is not configured or client failed to initialize."

        prompt = build_classification_prompt(
            title=job_data.get("title", ""),
            company_name=job_data.get("company_name", ""),
            location=job_data.get("location"),
            description=job_data.get("description", ""),
        )

        from google.genai import types

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1,
        )

        backoff = 2.0
        for attempt in range(1, max_retries + 1):
            self.usage.requests_count += 1
            try:
                logger.debug("Calling Gemini API (attempt %d/%d)", attempt, max_retries)
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                )

                # Record token metrics
                if hasattr(response, "usage_metadata") and response.usage_metadata:
                    in_tok = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
                    out_tok = getattr(response.usage_metadata, "candidates_token_count", 0) or 0
                    self.usage.input_tokens += in_tok
                    self.usage.output_tokens += out_tok
                    self.usage.total_tokens += (in_tok + out_tok)
                    self.usage.calculate_cost()

                raw_text = response.text or ""
                result, val_err = parse_and_validate_gemini_json(
                    raw_response=raw_text,
                    model_name=self.model_name,
                    prompt_version=self.prompt_version,
                )

                if result:
                    self.usage.successful_count += 1
                    return result, None

                logger.warning("Gemini output validation error on attempt %d: %s", attempt, val_err)
                if attempt == max_retries:
                    self.usage.failed_count += 1
                    return None, f"Validation failed after {max_retries} attempts: {val_err}"

            except Exception as e:
                err_str = str(e)
                logger.warning("Gemini API call failed on attempt %d: %s", attempt, err_str)
                # Rate limit handling: 429 ResourceExhausted
                if "429" in err_str or "ResourceExhausted" in err_str:
                    time.sleep(backoff)
                    backoff *= 2
                else:
                    time.sleep(1.0)

                if attempt == max_retries:
                    self.usage.failed_count += 1
                    return None, f"Gemini API error: {err_str}"

        return None, "Unexpected error in classify_job"
