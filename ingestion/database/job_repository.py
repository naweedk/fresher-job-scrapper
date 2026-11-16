"""
Job repository for persistence, deduplication lookups, and batch queries.
"""

from typing import Dict, List, Optional, Tuple
import psycopg
from schemas import ClassificationStatusEnum, JobStatusEnum, NormalizedJob


class JobRepository:
    def __init__(self, conn: psycopg.Connection):
        self.conn = conn

    def find_duplicate(
        self,
        source_id: str,
        external_id: Optional[str],
        canonical_url: str,
        content_hash: str,
    ) -> Optional[Dict]:
        """
        Multi-tier duplicate detection:
        1. Match on (source_id, external_id) if external_id is not null/empty
        2. Match on canonicalUrl
        3. Match on contentHash
        """
        with self.conn.cursor() as cur:
            # Level 1: Source + externalId
            if external_id:
                cur.execute(
                    'SELECT * FROM jobs WHERE "sourceId" = %s AND "externalId" = %s LIMIT 1',
                    (source_id, external_id),
                )
                row = cur.fetchone()
                if row:
                    return dict(row)

            # Level 2: Canonical URL
            if canonical_url:
                cur.execute(
                    'SELECT * FROM jobs WHERE "canonicalUrl" = %s LIMIT 1',
                    (canonical_url,),
                )
                row = cur.fetchone()
                if row:
                    return dict(row)

            # Level 3: Content hash
            if content_hash:
                cur.execute(
                    'SELECT * FROM jobs WHERE "contentHash" = %s LIMIT 1',
                    (content_hash,),
                )
                row = cur.fetchone()
                if row:
                    return dict(row)

        return None

    def upsert_job(
        self,
        job: NormalizedJob,
        company_id: str,
    ) -> Tuple[Dict, bool]:
        """
        Insert or match an existing job.
        Returns (job_record, is_new).
        """
        existing = self.find_duplicate(
            source_id=job.source_id,
            external_id=job.external_id,
            canonical_url=job.canonical_url,
            content_hash=job.content_hash,
        )

        with self.conn.cursor() as cur:
            if existing:
                # Update status/timestamps if appropriate
                job_id = existing["id"]
                cur.execute(
                    """
                    UPDATE jobs
                    SET status = %s::"JobStatus", "updatedAt" = NOW()
                    WHERE id = %s
                    RETURNING *
                    """,
                    (JobStatusEnum.ACTIVE.value, job_id),
                )
                updated = cur.fetchone()
                return dict(updated or existing), False

            # Insert new job
            cur.execute(
                """
                INSERT INTO jobs (
                    id, "companyId", "sourceId", "externalId", title,
                    description, location, "jobUrl", "canonicalUrl",
                    "contentHash", "postedAt", "expiresAt", status,
                    "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s, %s::"JobStatus",
                    NOW(), NOW()
                )
                RETURNING *
                """,
                (
                    company_id,
                    job.source_id,
                    job.external_id,
                    job.title,
                    job.description,
                    job.location,
                    job.job_url,
                    job.canonical_url,
                    job.content_hash,
                    job.posted_at,
                    job.expires_at,
                    job.status.value,
                ),
            )
            new_job = cur.fetchone()
            job_dict = dict(new_job)

            # Automatically create associated PENDING JobClassification
            cur.execute(
                """
                INSERT INTO job_classifications (
                    id, "jobId", status, skills, "createdAt", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), %s, %s::"ClassificationStatus", %s, NOW(), NOW()
                )
                """,
                (job_dict["id"], ClassificationStatusEnum.PENDING.value, []),
            )

            return job_dict, True

    def get_pending_classifications(self, limit: int = 20) -> List[Dict]:
        """Fetch jobs with PENDING or FAILED classification status."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    j.id as job_id,
                    j.title,
                    j.description,
                    j.location,
                    j."jobUrl" as job_url,
                    c.name as company_name,
                    jc.id as classification_id,
                    jc.status as classification_status
                FROM jobs j
                JOIN companies c ON j."companyId" = c.id
                JOIN job_classifications jc ON j.id = jc."jobId"
                WHERE jc.status = 'PENDING'
                ORDER BY j."createdAt" ASC
                LIMIT %s
                """,
                (limit,),
            )
            return [dict(r) for r in cur.fetchall()]

    def update_classification(
        self,
        job_id: str,
        role: Optional[str],
        city: Optional[str],
        job_type: Optional[str],
        experience_level: Optional[str],
        work_mode: Optional[str],
        skills: List[str],
        confidence: Optional[float],
        model_name: Optional[str],
        prompt_version: Optional[str],
        status: str,
    ) -> None:
        """Persist structured AI classification output."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                UPDATE job_classifications
                SET
                    role = %s,
                    city = %s,
                    "jobType" = %s::"JobType",
                    "experienceLevel" = %s::"ExperienceLevel",
                    "workMode" = %s::"WorkMode",
                    skills = %s,
                    confidence = %s,
                    "modelName" = %s,
                    "promptVersion" = %s,
                    status = %s::"ClassificationStatus",
                    "updatedAt" = NOW()
                WHERE "jobId" = %s
                """,
                (
                    role,
                    city,
                    job_type,
                    experience_level,
                    work_mode,
                    skills,
                    confidence,
                    model_name,
                    prompt_version,
                    status,
                    job_id,
                ),
            )
