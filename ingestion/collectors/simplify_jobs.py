"""
Collector for SimplifyJobs Verified Public Entry-Level and Internship Registries.
Source: https://github.com/SimplifyJobs/New-Grad-Positions & Summer2025-Internships
Collects verified, direct career-portal application links (Workday, Greenhouse, Lever, Ashby, etc.)
specifically dedicated to new college graduates, freshers, and interns.
"""

import json
import logging
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

NEW_GRAD_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json"
)
INTERNSHIPS_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/.github/scripts/listings.json"
)


class SimplifyJobsCollector(BaseCollector):
    """Collector for SimplifyJobs Open Graduate and Internship Registries."""

    def __init__(self):
        super().__init__(
            name="SimplifyJobs",
            base_url=NEW_GRAD_URL,
            timeout=30.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 2) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        targets = [
            ("New-Grad", NEW_GRAD_URL),
            ("Internships", INTERNSHIPS_URL),
        ]

        try:
            for label, url in targets[:max_pages]:
                logger.info("Fetching SimplifyJobs %s listings from %s", label, url)
                resp = client.get(url)
                if resp.status_code != 200:
                    logger.warning("SimplifyJobs %s returned status %d", label, resp.status_code)
                    continue

                items = json.loads(resp.text)
                logger.info("SimplifyJobs %s total listings: %d", label, len(items))

                # Filter for active listings
                active_items = [i for i in items if i.get("active", True)]
                logger.info("SimplifyJobs %s active listings: %d", label, len(active_items))

                for item in active_items:
                    locations = item.get("locations", [])
                    loc_str = ", ".join(locations) if locations else "Remote"

                    # Parse posted date and updated date
                    posted_at = None
                    source_updated_at = None
                    posted_epoch = item.get("date_posted")
                    updated_epoch = item.get("date_updated")

                    if posted_epoch:
                        try:
                            posted_at = datetime.fromtimestamp(int(posted_epoch), tz=timezone.utc)
                        except Exception:
                            pass
                    if updated_epoch:
                        try:
                            source_updated_at = datetime.fromtimestamp(int(updated_epoch), tz=timezone.utc)
                        except Exception:
                            pass

                    if not posted_at and source_updated_at:
                        posted_at = source_updated_at

                    role_title = item.get("title", "")
                    company = item.get("company_name", "")
                    job_url = item.get("url", "")

                    if not job_url or not company or not role_title:
                        continue

                    # Synthetic description from structured metadata if direct text absent
                    category = item.get("category", "Engineering")
                    sponsorship = item.get("sponsorship", "Unspecified")
                    degrees = ", ".join(item.get("degrees", [])) if item.get("degrees") else "Bachelor's / Master's"

                    description = (
                        f"{role_title} opportunity at {company}. "
                        f"Target audience: Recent college graduates, freshers and entry-level applicants. "
                        f"Category: {category}. Required degrees: {degrees}. "
                        f"Locations: {loc_str}. Sponsorship: {sponsorship}. "
                        f"Direct company application link: {job_url}"
                    )

                    raw_job = RawJob(
                        source_name=self.name,
                        external_id=str(item.get("id", job_url)),
                        title=role_title,
                        company_name=company,
                        description=description,
                        job_url=job_url,
                        location=loc_str,
                        posted_at=posted_at,
                        source_updated_at=source_updated_at,
                        company_url=item.get("company_url"),
                        tags=[category, label],
                    )
                    raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching SimplifyJobs data: %s", e)
        finally:
            client.close()

        logger.info("SimplifyJobs collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
