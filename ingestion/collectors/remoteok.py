"""
RemoteOK collector for public remote developer and tech jobs.
Official API: https://remoteok.com/api
Returns clean JSON with position, company, tags, apply_url, and description.
"""

import logging
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)


class RemoteOKCollector(BaseCollector):
    """Collector for RemoteOK Public API."""

    def __init__(self):
        super().__init__(
            name="RemoteOK",
            base_url="https://remoteok.com/api",
            timeout=25.0,
            rate_limit_delay=2.0,
        )

    def fetch_jobs(self, max_pages: int = 1) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching RemoteOK listings from %s", self.base_url)
            resp = client.get(self.base_url)
            if resp.status_code != 200:
                logger.warning("RemoteOK returned status %d", resp.status_code)
                return raw_jobs

            data = resp.json()
            # The first item in remoteok API is metadata/legal terms
            items = [d for d in data if isinstance(d, dict) and "position" in d]
            logger.info("RemoteOK returned %d valid job entries", len(items))

            for item in items:
                posted_at = None
                epoch = item.get("epoch")
                if epoch:
                    try:
                        posted_at = datetime.fromtimestamp(int(epoch), tz=timezone.utc)
                    except Exception:
                        pass

                raw_job = RawJob(
                    source_name=self.name,
                    external_id=str(item.get("id")),
                    title=item.get("position", ""),
                    company_name=item.get("company", ""),
                    description=item.get("description", ""),
                    job_url=item.get("apply_url") or item.get("url", ""),
                    location=item.get("location") or "Remote",
                    posted_at=posted_at,
                    company_logo=item.get("company_logo") or item.get("logo"),
                    tags=item.get("tags", []),
                )
                raw_jobs.append(raw_job)

        except Exception as e:
            logger.error("Error fetching RemoteOK jobs: %s", e)
        finally:
            client.close()

        logger.info("RemoteOK collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
