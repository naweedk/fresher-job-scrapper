"""
Base collector abstract class defining standard collection interface.
"""

from abc import ABC, abstractmethod
from typing import List
import httpx
from schemas import RawJob


class BaseCollector(ABC):
    """Abstract base class for all job source collectors."""

    def __init__(
        self,
        name: str,
        base_url: str,
        timeout: float = 30.0,
        rate_limit_delay: float = 1.0,
        max_retries: int = 3,
    ):
        self.name = name
        self.base_url = base_url
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries

    @abstractmethod
    def fetch_jobs(self, max_pages: int = 5) -> List[RawJob]:
        """
        Fetch raw job listings from the source.
        Must return a list of RawJob instances.
        """
        pass

    def get_http_client(self) -> httpx.Client:
        """Create an HTTP client with proper User-Agent and timeouts."""
        return httpx.Client(
            timeout=self.timeout,
            headers={
                "User-Agent": (
                    "FresherJobsIndiaBot/1.0 (+https://fresherjobsindia.org; "
                    "contact@fresherjobsindia.org)"
                ),
                "Accept": "application/json, application/xml, text/xml, */*",
            },
            follow_redirects=True,
        )
