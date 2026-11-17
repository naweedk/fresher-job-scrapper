"""
Jobicy Collector for public remote jobs.
Official API: https://jobicy.com/api/v2/remote-jobs
Permits free public access without API key, delivering structured JSON listings.
"""

import logging
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class JobicyCollector(BaseCollector):
    """Collector for Jobicy Remote Jobs API."""

    def __init__(self):
        super().__init__(
            name="Jobicy",
            base_url="https://jobicy.com/api/v2/remote-jobs",
            timeout=25.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching Jobicy listings from %s", self.base_url)
            resp = client.get(f"{self.base_url}?count=100")
            if resp.status_code != 200:
                logger.warning("Jobicy returned status %d", resp.status_code)
                return raw_jobs

            data = resp.json()
            jobs = data.get("jobs", [])
            logger.info("Jobicy API returned %d jobs", len(jobs))

            for item in jobs:
                posted_at = None
                pub_date = item.get("pubDate")
                if pub_date:
                    try:
                        posted_at = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                        if posted_at.tzinfo is None:
                            posted_at = posted_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        pass

                # Flatten tags into list of strings
                raw_tags = [
                    item.get("jobIndustry"),
                    item.get("jobLevel"),
                    item.get("jobType"),
                ]
                tags: List[str] = []
                for t in raw_tags:
                    if isinstance(t, list):
                        tags.extend(str(x) for x in t if x)
                    elif t:
                        tags.append(str(t))

                raw_job = RawJob(
                    source_name=self.name,
                    external_id=str(item.get("id")),
                    title=item.get("jobTitle", ""),
                    company_name=item.get("companyName", ""),
                    description=item.get("jobDescription", "") or item.get("jobExcerpt", ""),
                    job_url=item.get("url", ""),
                    location=item.get("jobGeo", "Remote"),
                    posted_at=posted_at,
                    company_logo=item.get("companyLogo"),
                    tags=tags,
                )
                raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching Jobicy listings: %s", e)
        finally:
            client.close()

        logger.info("Jobicy collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
