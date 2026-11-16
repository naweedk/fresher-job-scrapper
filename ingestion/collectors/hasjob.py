"""
Hasjob RSS/Atom feed collector for Indian developer & startup opportunities.
Feed: https://hasjob.co/feed
Provides real, public listings published by Indian startups and product companies.
"""

import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class HasjobCollector(BaseCollector):
    """Collector for Hasjob (Hasgeek) Atom Feed."""

    def __init__(self):
        super().__init__(
            name="Hasjob",
            base_url="https://hasjob.co/feed",
            timeout=25.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching Hasjob Atom feed from %s", self.base_url)
            resp = client.get(self.base_url)
            if resp.status_code != 200:
                logger.warning("Hasjob returned status %d", resp.status_code)
                return raw_jobs

            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            entries = root.findall("atom:entry", ns)
            logger.info("Hasjob feed contains %d entries", len(entries))

            for entry in entries:
                full_title = entry.findtext("atom:title", namespaces=ns) or ""
                link_el = entry.find("atom:link", namespaces=ns)
                link = link_el.attrib.get("href", "") if link_el is not None else ""
                entry_id = entry.findtext("atom:id", namespaces=ns) or link
                content = (
                    entry.findtext("atom:content", namespaces=ns)
                    or entry.findtext("atom:summary", namespaces=ns)
                    or full_title
                )
                pub_text = entry.findtext("atom:published", namespaces=ns)

                posted_at = None
                if pub_text:
                    try:
                        posted_at = datetime.fromisoformat(pub_text.replace("Z", "+00:00"))
                        if posted_at.tzinfo is None:
                            posted_at = posted_at.replace(tzinfo=timezone.utc)
                    except Exception:
                        pass

                # Parse title and company (often format: "Job Title - Company Name" or "Job Title at Company")
                company = "Hasjob Listing"
                title = full_title
                if " - " in full_title:
                    parts = full_title.rsplit(" - ", 1)
                    title, company = parts[0].strip(), parts[1].strip()
                elif " at " in full_title:
                    parts = full_title.rsplit(" at ", 1)
                    title, company = parts[0].strip(), parts[1].strip()

                raw_job = RawJob(
                    source_name=self.name,
                    external_id=entry_id,
                    title=title,
                    company_name=company,
                    description=content,
                    job_url=link,
                    location="India",
                    posted_at=posted_at,
                    tags=["India", "Tech", "Startup"],
                )
                raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching Hasjob listings: %s", e)
        finally:
            client.close()

        logger.info("Hasjob collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
