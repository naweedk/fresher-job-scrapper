"""
RemoteOK collector for public remote developer, design, and tech jobs.
Official API: https://remoteok.com/api
Returns clean JSON with position, company, tags, apply_url, and description.
"""

import logging
import time
from datetime import datetime, timezone
from typing import List, Set

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

SEARCH_TAGS = ["junior", "intern", "india", "support", "marketing", "dev"]


class RemoteOKCollector(BaseCollector):
    """Collector for RemoteOK Public API with multi-tag coverage."""

    def __init__(self):
        super().__init__(
            name="RemoteOK",
            base_url="https://remoteok.com/api",
            timeout=25.0,
            rate_limit_delay=1.5,
        )

    def fetch_jobs(self, max_pages: int = 4) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        seen_ids: Set[str] = set()
        client = self.get_http_client()

        tags_to_query = SEARCH_TAGS[:max_pages]

        try:
            for tag in tags_to_query:
                url = f"{self.base_url}?tag={tag}"
                logger.info("Fetching RemoteOK listings for tag '%s'", tag)
                try:
                    resp = client.get(url)
                    if resp.status_code != 200:
                        logger.warning("RemoteOK returned status %d for tag %s", resp.status_code, tag)
                        continue

                    data = resp.json()
                    # The first item in RemoteOK API is legal metadata
                    items = [d for d in data if isinstance(d, dict) and "position" in d]

                    for item in items:
                        ext_id = str(item.get("id"))
                        if ext_id in seen_ids:
                            continue
                        seen_ids.add(ext_id)

                        posted_at = None
                        epoch = item.get("epoch")
                        if epoch:
                            try:
                                posted_at = datetime.fromtimestamp(int(epoch), tz=timezone.utc)
                            except Exception:
                                pass

                        raw_job = RawJob(
                            source_name=self.name,
                            external_id=ext_id,
                            title=item.get("position", ""),
                            company_name=item.get("company", ""),
                            description=item.get("description", ""),
                            job_url=item.get("apply_url") or item.get("url", ""),
                            location=item.get("location") or "Remote",
                            posted_at=posted_at,
                            company_logo=item.get("company_logo") or item.get("logo"),
                            tags=item.get("tags", []) + [tag],
                        )
                        raw_jobs.append(raw_job)

                    time.sleep(self.rate_limit_delay)

                except Exception as tag_err:
                    logger.warning("Error fetching RemoteOK tag '%s': %s", tag, tag_err)

        except Exception as e:
            logger.error("RemoteOK collector encountered top-level error: %s", e)
        finally:
            client.close()

        logger.info("RemoteOK collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
