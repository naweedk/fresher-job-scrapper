"""
IngestionLog repository for recording ingestion run audits and metrics.
"""

from datetime import datetime, timezone
from typing import Dict, Optional
import psycopg


class IngestionLogRepository:
    def __init__(self, conn: psycopg.Connection):
        self.conn = conn

    def create_log(self, source_id: str) -> Dict:
        """Create an IngestionLog record in RUNNING status."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ingestion_logs (
                    id, "sourceId", "startedAt", "fetchedCount",
                    "insertedCount", "duplicateCount", "failedCount",
                    status, "createdAt"
                )
                VALUES (
                    gen_random_uuid(), %s, NOW(), 0,
                    0, 0, 0,
                    'RUNNING', NOW()
                )
                RETURNING *
                """,
                (source_id,),
            )
            return dict(cur.fetchone())

    def complete_log(
        self,
        log_id: str,
        fetched: int,
        inserted: int,
        duplicates: int,
        failed: int,
        status: str = "COMPLETED",
        error_message: Optional[str] = None,
    ) -> None:
        """Finalize an IngestionLog entry."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ingestion_logs
                SET
                    "completedAt" = NOW(),
                    "fetchedCount" = %s,
                    "insertedCount" = %s,
                    "duplicateCount" = %s,
                    "failedCount" = %s,
                    status = %s,
                    "errorMessage" = %s
                WHERE id = %s
                """,
                (fetched, inserted, duplicates, failed, status, error_message, log_id),
            )
