"""
Remotive collector for public remote jobs API.
Official API: https://remotive.com/api/remote-jobs
Permits free public access with reasonable request intervals.
"""

import logging
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class RemotiveCollector(BaseCollector):
    """Collector for Remotive Remote Jobs API."""

    def __init__(self):
        super().__init__(
            name="Remotive",
            base_url="https://remotive.com/api/remote-jobs",
            timeout=25.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching Remotive listings from %s", self.base_url)
            resp = client.get(self.base_url)
            if resp.status_code != 200:
                logger.warning("Remotive returned status %d", resp.status_code)
                return raw_jobs

            data = resp.json()
            jobs = data.get("jobs", [])
            logger.info("Remotive API returned %d jobs", len(jobs))

            for item in jobs:
                posted_at = None
                pub_date = item.get("publication_date")
                if pub_date:
                    try:
                        # Format example: "2026-11-14T08:00:00"
                        posted_at = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                        if posted_at.tzinfo is None:
                            posted_at = posted_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        pass

                raw_job = RawJob(
                    source_name=self.name,
                    external_id=str(item.get("id")),
                    title=item.get("title", ""),
                    company_name=item.get("company_name", ""),
                    description=item.get("description", ""),
                    job_url=item.get("url", ""),
                    location=item.get("candidate_required_location") or "Remote",
                    posted_at=posted_at,
                    company_logo=item.get("company_logo_url") or item.get("company_logo"),
                    tags=item.get("tags", []),
                )
                raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching Remotive jobs: %s", e)
        finally:
            client.close()

        logger.info("Remotive collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
