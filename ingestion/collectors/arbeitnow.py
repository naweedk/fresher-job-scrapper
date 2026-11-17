"""
Arbeitnow collector for public tech job board API.
API docs: https://www.arbeitnow.com/api/job-board-api
Permits public collection with attribution, delivers clean JSON payload with pagination.
"""

import logging
import time
from datetime import datetime, timezone
from typing import List, Set

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class ArbeitnowCollector(BaseCollector):
    """Collector for Arbeitnow Public Job Board API with pagination support."""

    def __init__(self):
        super().__init__(
            name="Arbeitnow",
            base_url="https://www.arbeitnow.com/api/job-board-api",
            timeout=25.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 5) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        seen_slugs: Set[str] = set()
        client = self.get_http_client()
        current_url = self.base_url
        page = 1

        try:
            while current_url and page <= max_pages:
                logger.info("Fetching Arbeitnow page %d: %s", page, current_url)
                try:
                    resp = client.get(current_url)
                    if resp.status_code != 200:
                        logger.warning("Arbeitnow returned status %d on page %d", resp.status_code, page)
                        break

                    data = resp.json()
                    items = data.get("data", [])
                    logger.info("Arbeitnow page %d returned %d items", page, len(items))

                    for item in items:
                        slug = item.get("slug")
                        if not slug or slug in seen_slugs:
                            continue
                        seen_slugs.add(slug)

                        # Extract date
                        posted_at = None
                        epoch = item.get("created_at")
                        if epoch:
                            try:
                                posted_at = datetime.fromtimestamp(epoch, tz=timezone.utc)
                            except Exception:
                                pass

                        raw_job = RawJob(
                            source_name=self.name,
                            external_id=slug,
                            title=item.get("title", ""),
                            company_name=item.get("company_name", ""),
                            description=item.get("description", ""),
                            job_url=item.get("url", ""),
                            location=item.get("location", "Remote"),
                            posted_at=posted_at,
                            tags=item.get("tags", []),
                        )
                        raw_jobs.append(raw_job)

                    # Extract pagination link
                    links = data.get("links", {})
                    current_url = links.get("next")
                    page += 1

                    if current_url and page <= max_pages:
                        time.sleep(self.rate_limit_delay)

                except Exception as page_err:
                    logger.warning("Error fetching Arbeitnow page %d: %s", page, page_err)
                    break

        except Exception as e:
            logger.error("Arbeitnow collector encountered error: %s", e)
        finally:
            client.close()

        logger.info("Arbeitnow collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
