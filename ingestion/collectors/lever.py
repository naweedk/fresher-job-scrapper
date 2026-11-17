"""
Lever Public Job Board API Collector.
Scrapes direct job postings from companies hiring in India using Lever ATS.
Extracts official epoch createdAt timestamps, parses location, and structures candidate roles.
"""

import logging
import time
from datetime import datetime, timezone
from typing import List, Optional

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

DEFAULT_LEVER_COMPANIES = [
    "paytm",
    "meesho",
    "cred",
    "zeta",
    "dunzo",
    "games24x7",
    "winzo",
    "pocketaces",
    "navi",
    "yubi",
    "clevertap",
    "urbancompany",
    "invideo",
    "simpl",
    "jupiter",
    "khatabook",
    "leadsq",
    "curefit",
    "glance",
]


class LeverCollector(BaseCollector):
    """Collector for public Lever career portals of companies hiring in India."""

    def __init__(self, companies: Optional[List[str]] = None):
        super().__init__(
            name="Lever",
            base_url="https://api.lever.co/v0/postings",
            timeout=25.0,
            rate_limit_delay=0.4,
        )
        self.companies = companies or DEFAULT_LEVER_COMPANIES

    def fetch_jobs(self, max_pages: int = 15) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        target_companies = self.companies[:max_pages]
        logger.info("Starting Lever collection for %d companies", len(target_companies))

        try:
            for company_slug in target_companies:
                url = f"{self.base_url}/{company_slug}?mode=json"
                try:
                    resp = client.get(url)
                    if resp.status_code != 200:
                        logger.debug("Lever board '%s' returned status %d", company_slug, resp.status_code)
                        continue

                    postings = resp.json()
                    if not isinstance(postings, list):
                        continue

                    company_name = company_slug.capitalize()

                    for item in postings:
                        title = item.get("text") or ""
                        job_url = item.get("hostedUrl") or item.get("applyUrl") or ""
                        ext_id = f"lever-{company_slug}-{item.get('id', job_url)}"

                        categories = item.get("categories") or {}
                        location = categories.get("location") or "India"
                        team = categories.get("team") or ""
                        commitment = categories.get("commitment") or ""

                        desc_plain = item.get("descriptionPlain") or item.get("description") or ""
                        description = f"{title} at {company_name} ({location}). Team: {team}. Type: {commitment}. {desc_plain}"

                        posted_at: Optional[datetime] = None
                        epoch = item.get("createdAt")
                        if epoch:
                            try:
                                posted_at = datetime.fromtimestamp(epoch / 1000.0, tz=timezone.utc)
                            except Exception:
                                posted_at = None

                        raw_job = RawJob(
                            source_name=self.name,
                            external_id=ext_id,
                            title=title,
                            company_name=company_name,
                            description=description,
                            job_url=job_url,
                            location=location,
                            posted_at=posted_at,
                            tags=["Lever", company_name, team, commitment],
                        )
                        raw_jobs.append(raw_job)

                    time.sleep(self.rate_limit_delay)

                except Exception as comp_err:
                    logger.warning("Error fetching Lever board '%s': %s", company_slug, comp_err)

        except Exception as e:
            logger.error("Lever collector encountered error: %s", e)
        finally:
            client.close()

        logger.info("Lever collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
