"""
GitHub India Internships & Entry-Level Opportunities Collector.
Source: Curated repository tracking verified Indian student & fresher internships
across Tech, Engineering, Management, Design, Sciences:
https://github.com/abhayclasher/internships-india
"""

import logging
import re
from datetime import datetime, timezone
from typing import List

from collectors.base import BaseCollector
from schemas import RawJob

logger = logging.getLogger(__name__)

TREE_API_URL = "https://api.github.com/repos/abhayclasher/internships-india/git/trees/main?recursive=1"
RAW_BASE_URL = "https://raw.githubusercontent.com/abhayclasher/internships-india/main/"


class GitHubIndiaInternshipsCollector(BaseCollector):
    """Collects verified Indian internships and fresher positions across multiple domains."""

    def __init__(self):
        super().__init__(
            name="GitHub India Internships",
            base_url="https://github.com/abhayclasher/internships-india",
            timeout=25.0,
            rate_limit_delay=0.5,
        )

    def fetch_jobs(self, max_pages: int = 20) -> List[RawJob]:
        raw_jobs: List[RawJob] = []
        client = self.get_http_client()

        try:
            logger.info("Fetching repository tree from %s", TREE_API_URL)
            tree_resp = client.get(TREE_API_URL)
            if tree_resp.status_code != 200:
                logger.warning("Failed to fetch tree from %s: status %d", TREE_API_URL, tree_resp.status_code)
                return raw_jobs

            tree_items = tree_resp.json().get("tree", [])
            md_files = [
                item["path"]
                for item in tree_items
                if item["path"].endswith(".md") and "README" not in item["path"]
            ]

            logger.info("Found %d markdown files in internships-india", len(md_files))

            for path in md_files[:max_pages]:
                file_url = f"{RAW_BASE_URL}{path}"
                try:
                    resp = client.get(file_url)
                    if resp.status_code != 200:
                        continue

                    category = path.replace("/internships.md", "").replace("_internships.md", "").replace("/", " - ")
                    blocks = resp.text.split("#### ")

                    for b in blocks[1:]:
                        lines = b.splitlines()
                        if not lines:
                            continue
                        company_line = lines[0].strip()
                        company = re.sub(r"^[^\w\s]+", "", company_line).strip()

                        role_m = re.search(r"\*\*.*Role\*\*\s*\|\s*([^|\n]+)", b)
                        loc_m = re.search(r"\*\*.*Location\*\*\s*\|\s*([^|\n]+)", b)
                        stipend_m = re.search(r"\*\*.*Stipend\*\*\s*\|\s*([^|\n]+)", b)
                        duration_m = re.search(r"\*\*.*Duration\*\*\s*\|\s*([^|\n]+)", b)
                        qual_m = re.search(r"\*\*.*Qual\.\*\*\s*\|\s*([^|\n]+)", b)
                        skills_m = re.search(r"\*\*.*Skills\*\*\s*\|\s*([^|\n]+)", b)

                        # Match target application URL from [![Apply Now](badge)](url)
                        link_m = re.search(r"\[!\[Apply Now\].*?\]\((https?://[^)]+)\)", b)
                        if not link_m:
                            link_m = re.search(r"\[.*Apply Now.*\]\((https?://[^)]+)\)", b)
                        if not link_m:
                            links = re.findall(r"\((https?://[^\s)]+)\)", b)
                            valid_links = [l for l in links if "shields.io" not in l and "mailto:" not in l]
                            link = valid_links[0] if valid_links else None
                        else:
                            link = link_m.group(1).strip()

                        if role_m and loc_m and link and company:
                            role = role_m.group(1).strip()
                            loc = loc_m.group(1).strip()
                            stipend = stipend_m.group(1).strip() if stipend_m else "Competitive"
                            duration = duration_m.group(1).strip() if duration_m else "3-6 Months"
                            qual = qual_m.group(1).strip() if qual_m else "Graduate / Student"
                            skills = skills_m.group(1).strip() if skills_m else ""

                            description = (
                                f"{role} opportunity at {company}. "
                                f"Location: {loc}. Category: {category}. "
                                f"Stipend: {stipend}. Duration: {duration}. "
                                f"Qualifications: {qual}. Required Skills: {skills}. "
                                f"Verified Indian entry-level / fresher internship opening."
                            )

                            ext_id = f"gh-india-{abs(hash(link))}"

                            raw_job = RawJob(
                                source_name=self.name,
                                external_id=ext_id,
                                title=role,
                                company_name=company,
                                description=description,
                                job_url=link,
                                location=loc,
                                posted_at=datetime.now(timezone.utc),
                                tags=["India", "Internship", category],
                            )
                            raw_jobs.append(raw_job)

                except Exception as file_err:
                    logger.warning("Error processing %s: %s", path, file_err)

        except Exception as e:
            logger.error("Error fetching GitHub India Internships: %s", e)
        finally:
            client.close()

        logger.info("GitHub India Internships collector completed. Total fetched: %d", len(raw_jobs))
        return raw_jobs
