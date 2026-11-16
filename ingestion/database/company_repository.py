"""
Company repository for matching, deduplicating, and persisting companies.
"""

from typing import Dict, Optional
import psycopg


class CompanyRepository:
    def __init__(self, conn: psycopg.Connection):
        self.conn = conn

    def get_or_create(
        self,
        name: str,
        website: Optional[str] = None,
        logo_url: Optional[str] = None,
    ) -> Dict:
        """
        Lookup company by case-insensitive name match or create it if not found.
        """
        clean_name = name.strip()
        with self.conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM companies WHERE LOWER(TRIM(name)) = LOWER(TRIM(%s)) LIMIT 1",
                (clean_name,),
            )
            row = cur.fetchone()
            if row:
                # Update website or logo if previously missing and now available
                company_id = row["id"]
                updates = []
                params = []
                if website and not row.get("website"):
                    updates.append("website = %s")
                    params.append(website)
                if logo_url and not row.get("logoUrl"):
                    updates.append('"logoUrl" = %s')
                    params.append(logo_url)
                if updates:
                    updates.append('"updatedAt" = NOW()')
                    params.append(company_id)
                    cur.execute(
                        f"UPDATE companies SET {', '.join(updates)} WHERE id = %s",
                        tuple(params),
                    )
                return dict(row)

            # Insert new company
            cur.execute(
                """
                INSERT INTO companies (id, name, website, "logoUrl", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, NOW(), NOW())
                RETURNING *
                """,
                (clean_name, website, logo_url),
            )
            created = cur.fetchone()
            return dict(created)
