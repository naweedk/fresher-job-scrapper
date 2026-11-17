"""
Greenhouse Public Career Boards Collector for Verified Indian Openings.
Queries official Greenhouse job board REST APIs (https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true)
for prominent multinational and Indian tech enterprises hiring in Indian tech hubs.
"""

import logging
import time
from datetime import datetime, timezone
from typing import List, Optional

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

# Established companies with major development centers and offices in India on Greenhouse
DEFAULT_GREENHOUSE_COMPANIES = [
    "inmobi",
    "thoughtworks",
    "databricks",
    "okta",
    "mongodb",
    "zscaler",
    "rubrik",
    "purestorage",
    "highradius",
    "stripe",
    "gitlab",
    "fivetran",
    "elastic",
    "druva",
    "airbnb",
    "twilio",
    "coinbase",
    "groww",
    "starburst",
    "samsara",
    "mixpanel",
    "launchdarkly",
    "figma",
    "cockroachlabs",
]


class GreenhouseCollector(BaseCollector):
    """Collector for public Greenhouse career portals of companies hiring in India."""

    def __init__(self, companies: Optional[List[str]] = None):
        super().__init__(
            name="Greenhouse",
            base_url="https://boards-api.greenhouse.io/v1/boards",
            timeout=25.0,
            rate_limit_delay=0.4,
        )
        self.companies = companies or DEFAULT_GREENHOUSE_COMPANIES

    def fetch_jobs(self, max_pages: int = 30) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        target_companies = self.companies[:max_pages]
        logger.info("Starting Greenhouse collection for %d companies", len(target_companies))

        try:
            for company_slug in target_companies:
                url = f"{self.base_url}/{company_slug}/jobs?content=true"
                try:
                    resp = client.get(url)
                    if resp.status_code != 200:
                        logger.debug("Greenhouse board '%s' returned status %d", company_slug, resp.status_code)
                        continue

                    data = resp.json()
                    jobs = data.get("jobs", [])
                    company_name = company_slug.capitalize()

                    for item in jobs:
                        loc_obj = item.get("location") or {}
                        loc_name = loc_obj.get("name") if isinstance(loc_obj, dict) else str(loc_obj)
                        loc_name = loc_name or ""

                        title = item.get("title") or ""
                        job_url = item.get("absolute_url") or ""
                        ext_id = f"gh-{company_slug}-{item.get('id', job_url)}"
                        content = item.get("content") or f"{title} at {company_name} in {loc_name}"

                        # Parse updated_at
                        posted_at = None
                        up_str = item.get("updated_at")
                        if up_str:
                            try:
                                posted_at = datetime.fromisoformat(up_str.replace("Z", "+00:00"))
                                if posted_at.tzinfo is None:
                                    posted_at = posted_at.replace(tzinfo=timezone.utc)
                            except Exception:
                                pass

                        raw_job = RawJob(
                            source_name=self.name,
                            external_id=ext_id,
                            title=title,
                            company_name=company_name,
                            description=content,
                            job_url=job_url,
                            location=loc_name,
                            posted_at=posted_at or datetime.now(timezone.utc),
                            tags=["Greenhouse", company_name],
                        )
                        raw_jobs.append(raw_job)

                    time.sleep(self.rate_limit_delay)

                except Exception as comp_err:
                    logger.warning("Error fetching Greenhouse board '%s': %s", company_slug, comp_err)

        except Exception as e:
            logger.error("Greenhouse collector encountered top-level error: %s", e)
        finally:
            client.close()

        logger.info("Greenhouse collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
