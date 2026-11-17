"""
Database connection pool and query helpers using psycopg 3.
Connects directly to PostgreSQL using DATABASE_URL.
"""

import logging
from contextlib import contextmanager
from typing import Generator
import psycopg
from psycopg.rows import dict_row

from config import get_settings

logger = logging.getLogger(__name__)


@contextmanager
def get_db_connection() -> Generator[psycopg.Connection, None, None]:
    """Provide a transactional database connection."""
    settings = get_settings()
    # Strip unsupported URI query parameters (e.g. ?schema=public used by Prisma)
    db_url = settings.database_url
    if "?" in db_url:
        db_url = db_url.split("?")[0]
    conn = psycopg.connect(db_url, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error("Database transaction rolled back due to error: %s", e)
        raise
    finally:
        conn.close()


def check_db_health() -> bool:
    """Check if PostgreSQL is reachable and responsive."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                res = cur.fetchone()
                return bool(res)
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        return False
