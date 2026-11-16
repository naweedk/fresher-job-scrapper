"""
Source repository for querying, registering, and seeding active sources.
"""

from typing import Dict, Optional
import psycopg
from schemas import SourceTypeEnum


class SourceRepository:
    def __init__(self, conn: psycopg.Connection):
        self.conn = conn

    def get_or_create(
        self,
        name: str,
        source_type: SourceTypeEnum = SourceTypeEnum.API,
        base_url: Optional[str] = None,
    ) -> Dict:
        """Find existing source by name or insert a new one."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM sources WHERE name = %s LIMIT 1", (name,))
            row = cur.fetchone()
            if row:
                return dict(row)

            # Insert new source
            cur.execute(
                """
                INSERT INTO sources (id, name, "sourceType", "baseUrl", "isActive", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s::"SourceType", %s, true, NOW(), NOW())
                RETURNING *
                """,
                (name, source_type.value, base_url),
            )
            created = cur.fetchone()
            return dict(created)

    def get_by_name(self, name: str) -> Optional[Dict]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT * FROM sources WHERE name = %s LIMIT 1", (name,))
            row = cur.fetchone()
            return dict(row) if row else None
