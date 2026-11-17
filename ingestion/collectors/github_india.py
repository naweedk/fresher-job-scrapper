"""
GitHub India Internships & Fresher Opportunities Collector.
Source: Curated, automated daily tracker of tech internships & entry-level roles in India
from 160+ verified company career portals:
https://github.com/Sarthzk/internship-tracker
Preserves authentic date_posted and first_seen metadata, validates status, and links directly to official career pages.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

LISTINGS_JSON_URL = "https://raw.githubusercontent.com/Sarthzk/internship-tracker/main/data/listings.json"


class GitHubIndiaInternshipsCollector(BaseCollector):
    """Collects verified Indian tech internships and fresher positions with authentic posting timestamps."""

    def __init__(self):
        super().__init__(
            name="GitHub India Internships",
            base_url="https://github.com/Sarthzk/internship-tracker",
            timeout=25.0,
            rate_limit_delay=0.5,
        )

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching Indian tech internship listings from %s", LISTINGS_JSON_URL)
            resp = client.get(LISTINGS_JSON_URL)
            if resp.status_code != 200:
                logger.warning("Failed to fetch listings: status %d", resp.status_code)
                return raw_jobs

            listings = resp.json()
            if not isinstance(listings, list):
                logger.warning("Unexpected listings response format")
                return raw_jobs

            logger.info("Retrieved %d total listings from tracker", len(listings))

            for item in listings:
                # Only collect active, currently open postings
                status = item.get("status", "open")
                if status != "open":
                    continue

                title = item.get("title", "").strip()
                company = item.get("company", "").strip()
                job_url = item.get("url", "").strip()
                ext_id = item.get("id") or item.get("external_id") or f"gh-in-{abs(hash(job_url))}"

                if not title or not company or not job_url:
                    continue

                locations = item.get("locations") or []
                loc_str = ", ".join(locations) if locations else "India"

                category = item.get("category", "tech")
                description = (
                    f"{title} opportunity at {company}. "
                    f"Category: {category}. Locations: {loc_str}. "
                    f"Verified Indian entry-level / fresher opportunity. "
                    f"Direct application link: {job_url}"
                )

                # Parse authentic date_posted or first_seen
                posted_at: Optional[datetime] = None
                date_posted_str = item.get("date_posted")
                if date_posted_str:
                    try:
                        # Format can be YYYY-MM-DD or full ISO
                        posted_at = datetime.fromisoformat(date_posted_str.replace("Z", "+00:00"))
                        if posted_at.tzinfo is None:
                            posted_at = posted_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        posted_at = None

                # Parse first_seen
                first_seen_str = item.get("first_seen")
                if not posted_at and first_seen_str:
                    try:
                        posted_at = datetime.fromisoformat(first_seen_str.replace("Z", "+00:00"))
                        if posted_at.tzinfo is None:
                            posted_at = posted_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        posted_at = None

                # Parse source_updated_at from last_seen
                source_updated_at: Optional[datetime] = None
                last_seen_str = item.get("last_seen")
                if last_seen_str:
                    try:
                        source_updated_at = datetime.fromisoformat(last_seen_str.replace("Z", "+00:00"))
                        if source_updated_at.tzinfo is None:
                            source_updated_at = source_updated_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        source_updated_at = None

                raw_job = RawJob(
                    source_name=self.name,
                    external_id=ext_id,
                    title=title,
                    company_name=company,
                    description=description,
                    job_url=job_url,
                    location=loc_str,
                    posted_at=posted_at,
                    source_updated_at=source_updated_at,
                    tags=["India", "Internship", category],
                )
                raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching GitHub India Internships: %s", e)
        finally:
            client.close()

        logger.info("GitHub India Internships collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
