"""
Naukri Collector (Optional Collector).

COMPLIANCE & ARCHITECTURAL NOTE:
Naukri does not provide an open public job-search API. Automated scraping without
authorization is strictly prohibited by Naukri's Terms of Service and protected by
CAPTCHA and Cloudflare bot management.
Per engineering guidelines:
- Do NOT bypass CAPTCHA, authentication, bot protection or access restrictions.
- Use only authorised or permitted access, or a licensed provider feed.
- This collector is OPTIONAL and disabled by default unless valid enterprise/partner
  API credentials (NAUKRI_API_KEY) or a licensed feed URL (NAUKRI_FEED_URL) are configured.
"""

import logging
import os
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class NaukriCollector(BaseCollector):
    """Optional Naukri collector operating strictly through authorized partner/licensed feeds."""

    def __init__(self):
        super().__init__(
            name="Naukri (Authorized / Licensed)",
            base_url=os.getenv("NAUKRI_FEED_URL", "https://api.naukri.com/v1/partner/jobs"),
            timeout=20.0,
            rate_limit_delay=1.0,
        )
        self.api_key = os.getenv("NAUKRI_API_KEY", "")
        self.client_id = os.getenv("NAUKRI_CLIENT_ID", "")
        self.is_configured = bool(self.api_key or os.getenv("NAUKRI_FEED_URL"))

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        """
        Fetch listings from authorized Naukri partner API or licensed provider.
        If credentials are not configured, cleanly logs notice and skips without error.
        """
        raw_jobs: List[RawJob] = []

        if not self.is_configured:
            logger.info(
                "Naukri Collector: Optional collector skipped. Naukri does not provide an open "
                "public API and scraping violates access restrictions. To enable, configure "
                "NAUKRI_API_KEY or NAUKRI_FEED_URL with an authorized licensed feed provider."
            )
            return raw_jobs

        client = self.get_http_client()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "X-Client-Id": self.client_id,
        }

        try:
            logger.info("Connecting to authorized Naukri partner endpoint: %s", self.base_url)
            resp = client.get(self.base_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("jobs", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
                for item in items:
                    raw_jobs.append(
                        RawJob(
                            source_name=self.name,
                            external_id=str(item.get("id", item.get("jobId", ""))),
                            title=item.get("title", ""),
                            company_name=item.get("companyName", item.get("company", "")),
                            description=item.get("description", ""),
                            job_url=item.get("url", item.get("jobUrl", "")),
                            location=item.get("location", "India"),
                            tags=["Naukri", "AuthorizedPartner"],
                        )
                    )
                logger.info("Naukri authorized collector fetched %d jobs", len(raw_jobs))
            else:
                logger.warning("Naukri partner API returned status %d: %s", resp.status_code, resp.text[:200])
        except Exception as e:
            logger.error("Error connecting to authorized Naukri feed: %s", e)
        finally:
            client.close()

        return raw_jobs
