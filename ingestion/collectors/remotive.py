"""
Remotive collector for public remote jobs API.
Official API: https://remotive.com/api/remote-jobs
Permits free public access with reasonable request intervals.
"""

import logging
import time
from datetime import datetime, timezone
from typing import List, Set

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

SEARCH_QUERIES = ["india", "junior", "intern", "entry", "support", "developer"]


class RemotiveCollector(BaseCollector):
    """Collector for Remotive Remote Jobs API with targeted search coverage."""

    def __init__(self):
        super().__init__(
            name="Remotive",
            base_url="https://remotive.com/api/remote-jobs",
            timeout=25.0,
            rate_limit_delay=1.0,
        )

    def fetch_jobs(self, max_pages: int = 4) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        seen_ids: Set[str] = set()
        client = self.get_http_client()

        queries_to_run = SEARCH_QUERIES[:max_pages]

        try:
            for q in queries_to_run:
                url = f"{self.base_url}?search={q}"
                logger.info("Fetching Remotive listings for query '%s'", q)
                try:
                    resp = client.get(url)
                    if resp.status_code != 200:
                        logger.warning("Remotive returned status %d for query %s", resp.status_code, q)
                        continue

                    data = resp.json()
                    jobs = data.get("jobs", [])

                    for item in jobs:
                        ext_id = str(item.get("id"))
                        if ext_id in seen_ids:
                            continue
                        seen_ids.add(ext_id)

                        posted_at = None
                        pub_date = item.get("publication_date")
                        if pub_date:
                            try:
                                posted_at = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                                if posted_at.tzinfo is None:
                                    posted_at = posted_at.replace(tzinfo=timezone.utc)
                            except Exception:
                                pass

                        raw_job = RawJob(
                            source_name=self.name,
                            external_id=ext_id,
                            title=item.get("title", ""),
                            company_name=item.get("company_name", ""),
                            description=item.get("description", ""),
                            job_url=item.get("url", ""),
                            location=item.get("candidate_required_location") or "Remote",
                            posted_at=posted_at,
                            company_logo=item.get("company_logo"),
                            tags=item.get("tags", []) + [item.get("category", ""), q],
                        )
                        raw_jobs.append(raw_job)

                    time.sleep(self.rate_limit_delay)

                except Exception as q_err:
                    logger.warning("Error fetching Remotive query '%s': %s", q, q_err)

        except Exception as e:
            logger.error("Remotive collector encountered error: %s", e)
        finally:
            client.close()

        logger.info("Remotive collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
