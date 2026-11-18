# Document 03: Complete Folder Structure & File-by-File Technical Guide — Fresher Jobs India

## Executive Summary & True Repository Tree

This guide documents the **exact files that exist in the repository**, their operational purpose, exported symbols, inputs/outputs, and failure impact.

```
fresher-job-scrapper/
├── .github/
│   └── workflows/
│       └── daily-ingestion.yml          # GitHub Actions scheduled workflow
├── apps/
│   ├── api/                             # NestJS 10 REST API application
│   │   ├── prisma/
│   │   │   ├── migrations/              # PostgreSQL migration history
│   │   │   │   ├── 20261116090001_init/
│   │   │   │   ├── 20261116123652_add_india_eligibility/
│   │   │   │   └── 20261117103000_add_canonical_dates/
│   │   │   └── schema.prisma            # Declarative database models and enums
│   │   ├── src/
│   │   │   ├── common/health/           # Liveness & database health endpoints
│   │   │   ├── companies/               # Company lookup endpoints
│   │   │   ├── jobs/                    # Primary job discovery, search & filtering
│   │   │   │   ├── dto/query-jobs.dto.ts
│   │   │   │   ├── jobs.controller.ts
│   │   │   │   ├── jobs.module.ts
│   │   │   │   ├── jobs.service.spec.ts # Unit tests for service logic
│   │   │   │   └── jobs.service.ts      # Core business query & Prisma logic
│   │   │   ├── prisma/                  # PrismaClient wrapper service
│   │   │   ├── sources/                 # Source registry endpoints
│   │   │   ├── stats/                   # Platform aggregations & metrics
│   │   │   ├── app.controller.ts        # Root ping controller
│   │   │   ├── app.module.ts            # Root application module wiring
│   │   │   └── main.ts                  # NestJS bootstrap entry point
│   │   ├── package.json                 # Backend dependencies & scripts
│   │   └── tsconfig.json                # TypeScript compiler configuration
│   └── web/                             # Next.js 16 (React 19) Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── about/page.tsx       # Platform mission & engineering details
│       │   │   ├── jobs/[id]/page.tsx   # Dynamic job detail page
│       │   │   ├── layout.tsx           # Global HTML root layout & theme wrapper
│       │   │   ├── not-found.tsx        # 404 handler
│       │   │   └── page.tsx             # Primary job search & discovery workspace
│       │   ├── components/
│       │   │   ├── common/              # EmptyState, ErrorState, LoadingState
│       │   │   ├── jobs/                # JobCard, JobResultsHeader, JobSearchHeader, etc.
│       │   │   ├── layout/              # Header, Footer
│       │   │   └── stats/               # PlatformStats card
│       │   ├── hooks/                   # useJobs, useJobFilters
│       │   ├── services/                # api.ts, jobs.service.ts, stats.service.ts
│       │   ├── theme/                   # theme.ts, ThemeRegistry.tsx
│       │   ├── types/                   # api.types.ts, index.ts
│       │   └── utils/                   # date.ts (canonical date engine)
│       ├── package.json                 # Frontend dependencies & Next.js scripts
│       └── next.config.ts               # Next.js configuration
├── ingestion/                           # Python 3.13 ETL Engine & AI Pipeline
│   ├── collectors/                      # Source-specific crawlers & API clients
│   │   ├── base.py                      # BaseCollector abstract base class
│   │   ├── arbeitnow.py                 # Arbeitnow job collector
│   │   ├── github_india.py              # Sarthzk/internship-tracker India crawler
│   │   ├── greenhouse.py                # Greenhouse ATS public boards crawler
│   │   ├── hasjob.py                    # Hasgeek India startup Atom feed collector
│   │   ├── jobicy.py                    # Jobicy remote jobs API collector
│   │   ├── lever.py                     # Lever ATS public postings collector
│   │   ├── naukri.py                    # Optional licensed Naukri collector
│   │   ├── remoteok.py                  # RemoteOK API collector
│   │   ├── remotive.py                  # Remotive API collector
│   │   └── simplify_jobs.py             # SimplifyJobs graduate & internship registry
│   ├── database/                        # Database connection & Psycopg repositories
│   │   ├── company_repository.py        # Company upserts & lookups
│   │   ├── connection.py                # PostgreSQL connection pooling & healthcheck
│   │   ├── ingestion_log_repository.py  # Ingestion audit logging
│   │   ├── job_repository.py            # Job deduplication, upsert & expiry
│   │   └── source_repository.py         # Source registration
│   ├── processors/                      # Data transformation, AI & filtering engines
│   │   ├── ai_classifier.py             # Gemini 2.5 Flash async batch worker
│   │   ├── classification_prompt.py     # Prompt engineering & few-shot instructions
│   │   ├── classification_validator.py  # Output validation & JSON parsing
│   │   ├── content_hasher.py            # SHA-256 deduplication hashing
│   │   ├── eligibility.py               # Fresher scope & senior exclusion rules
│   │   ├── freshness.py                 # Posting date validation & freshness tagging
│   │   ├── india_eligibility.py         # Strict geographic Indian validation matrix
│   │   ├── normalizer.py                # Unified schema transformation
│   │   ├── url_normalizer.py            # UTM param stripping & canonical URLs
│   │   └── validators.py                # Structural schema validation
│   ├── schemas/                         # Pydantic v2 schemas & enum definitions
│   │   └── __init__.py                  # RawJob, NormalizedJob, ClassificationResult
│   ├── tests/                           # 50 unit tests across Python modules
│   ├── backfill_dates.py                # Standalone script restoring historical dates
│   ├── backfill_india_eligibility.py    # Standalone script re-evaluating Indian geography
│   ├── config.py                        # Pydantic Settings environment configuration
│   ├── main.py                          # CLI entry point for ingestion & classification
│   ├── pipeline.py                      # Master pipeline orchestrator
│   └── requirements.txt                 # Python dependencies
├── .env.example                         # Environment configuration template
├── docker-compose.yml                   # PostgreSQL 16 container definition
├── package.json                         # Monorepo root script runner
└── pnpm-workspace.yaml                  # Monorepo workspace configuration
```

---

## 1. Root Directory Configuration Files

### 1. `docker-compose.yml`
- **Purpose**: Spins up the local PostgreSQL container.
- **Key Details**: Uses image `postgres:16-alpine`, container name `fresher_jobs_postgres`, health check `pg_isready`, and mounts volume `postgres_data`.
- **Port Mapping**: Maps host port `5434` to container port `5432` to avoid host conflicts.
- **What breaks if removed**: Local database container cannot be started with `pnpm db:up`.

### 2. `package.json` (Root)
- **Purpose**: Monorepo orchestration.
- **Key Scripts**:
  - `dev`: Runs `pnpm dev:web` and `pnpm dev:api` concurrently.
  - `db:up`: Starts Docker PostgreSQL.
  - `db:migrate`: Runs Prisma migrations in `apps/api`.
- **What breaks if removed**: Monorepo scripts and dependency links break.

### 3. `pnpm-workspace.yaml`
- **Purpose**: Defines workspace packages (`apps/*`).
- **What breaks if removed**: PNPM stops treating `apps/api` and `apps/web` as monorepo packages.

### 4. `.env.example`
- **Purpose**: Documentation template for all required runtime environment variables across Python, NestJS, Next.js, and Docker.

---

## 2. Ingestion Pipeline (`ingestion/`)

### 1. `ingestion/main.py`
- **Purpose**: CLI entry point for running data ingestion, AI classification, and database health checks.
- **Key Functions**: `main()`, `print_banner()`.
- **CLI Flags**: `--stage` (`all`, `collect`, `classify`, `filter-india`, `test-db`), `--source` (`greenhouse`, `lever`, etc.), `--pages` (max pages per source), `--limit` (max jobs to classify).
- **What breaks if removed**: Ingestion cannot be executed from the command line.

### 2. `ingestion/pipeline.py`
- **Purpose**: Orchestrates the sequential pipeline: collection → validation → normalization → eligibility → India check → freshness check → company resolution → deduplication → persistence → AI classification.
- **Key Class**: `IngestionPipeline` (`run_all()`).
- **Dependencies**: All collectors, processors, and database repositories.
- **What breaks if removed**: The end-to-end data pipeline ceases to function.

### 3. `ingestion/config.py`
- **Purpose**: Type-safe configuration management using `pydantic_settings.BaseSettings`.
- **Key Class**: `Settings` (`get_settings()`).
- **Handles**: `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, batch sizes, and timeout limits.

### 4. `ingestion/collectors/base.py`
- **Purpose**: Abstract base class establishing the contract for all collectors.
- **Key Class**: `BaseCollector` (`fetch_jobs(max_pages) -> List[RawJob]`, `get_http_client()`).

### 5. `ingestion/collectors/greenhouse.py`
- **Purpose**: Scrapes official public career portals of 33+ companies hiring in India on Greenhouse ATS.
- **Key Feature**: Extracts authentic `first_published` timestamp; preserves company identity; extracts location.

### 6. `ingestion/collectors/lever.py`
- **Purpose**: Collects postings from 19+ top Indian tech employers using Lever ATS (Paytm, Meesho, Cred, Zeta, etc.).
- **Key Feature**: Converts Lever epoch `createdAt` milliseconds into UTC `datetime`.

### 7. `ingestion/collectors/github_india.py`
- **Purpose**: Ingests verified Indian tech internships from `Sarthzk/internship-tracker`.
- **Key Feature**: Parses `date_posted`, `first_seen`, `last_seen`, and active application links.

### 8. `ingestion/collectors/hasjob.py`
- **Purpose**: Parses Hasjob (Hasgeek) Atom feed for Indian startups and tech opportunities.

### 9. `ingestion/collectors/simplify_jobs.py`
- **Purpose**: Parses SimplifyJobs New-Grad and Summer Intern registries, extracting direct career portal application links.

### 10. `ingestion/processors/india_eligibility.py`
- **Purpose**: The geographic brain of the platform. Evaluates whether a job is `VERIFIED_INDIAN`, `INTERNATIONAL`, or `AMBIGUOUS`.
- **Key Function**: `evaluate_india_eligibility(location, description, remote_scope)`.
- **Logic**: Inspects city aliases, Indian states, pin codes, and prevents false positives (e.g., Indianapolis, Indiana vs India).

### 11. `ingestion/processors/freshness.py`
- **Purpose**: Evaluates authentic posting dates against UTC current time.
- **Key Function**: `evaluate_job_freshness(posted_at, reference_time)`.
- **Enums**: `FreshnessStatus` (`FRESH`, `RECENT`, `STALE`, `UNKNOWN`, `FUTURE`).

### 12. `ingestion/processors/eligibility.py`
- **Purpose**: Enforces fresher scope. Accepts internships, entry-level, and 0–2 years; rejects senior titles ("Lead", "Principal", "Manager", "3+ years").

### 13. `ingestion/processors/ai_classifier.py`
- **Purpose**: Interacts with Google Gemini 2.5 Flash to categorize roles, extract skills, and assign confidence scores.

### 14. `ingestion/database/job_repository.py`
- **Purpose**: Manages PostgreSQL database operations for jobs.
- **Key Functions**: `upsert_job()`, `mark_expired_jobs()`, `get_unclassified_jobs()`, `update_classification()`.
- **Idempotency Rule**: On conflict, updates `lastSeenAt` and `sourceUpdatedAt` but preserves original `postedAt` and `firstSeenAt`.

---

## 3. NestJS Backend API (`apps/api/`)

### 1. `apps/api/src/main.ts`
- **Purpose**: Bootstraps the NestJS server.
- **Features**: Enables CORS for `FRONTEND_URL`, sets global prefix `/api`, and attaches global `ValidationPipe` with `{ transform: true, whitelist: true }`.

### 2. `apps/api/prisma/schema.prisma`
- **Purpose**: Single source of truth for database modeling.
- **Defines**: `Company`, `Source`, `Job`, `JobClassification`, `IngestionLog` models and enums (`WorkMode`, `JobType`, `ExperienceLevel`, `IndiaEligibility`, `ClassificationStatus`).

### 3. `apps/api/src/jobs/jobs.controller.ts`
- **Purpose**: Exposes REST endpoints for job retrieval.
- **Routes**:
  - `GET /api/jobs`: Query jobs with pagination and filters.
  - `GET /api/jobs/filters`: Faceted filter values.
  - `GET /api/jobs/:id`: Job details.

### 4. `apps/api/src/jobs/jobs.service.ts`
- **Purpose**: Implements core database querying via Prisma.
- **Enforces**: Default sorting by `postedAt DESC`, default 30-day freshness window, and active Indian status.

### 5. `apps/api/src/jobs/dto/query-jobs.dto.ts`
- **Purpose**: Validates incoming query string parameters using `class-validator` and `class-transformer`.

### 6. `apps/api/src/stats/stats.service.ts`
- **Purpose**: Aggregates total jobs, active companies, sources, work modes, and job types for dashboard display.

---

## 4. Next.js Frontend Client (`apps/web/`)

### 1. `apps/web/src/app/page.tsx`
- **Purpose**: Primary discovery homepage.
- **Components Wired**: `Header`, `JobSearchHeader`, `JobResultsHeader`, `JobList`, `JobPagination`, `Footer`.
- **Default State**: `sortBy: 'postedAt'`, `sortOrder: 'desc'`, `dateRange: '30d'`.

### 2. `apps/web/src/app/jobs/[id]/page.tsx`
- **Purpose**: Detailed job view with full job description, sticky apply CTA, platform source verification badge, and canonical date timeline.

### 3. `apps/web/src/utils/date.ts`
- **Purpose**: Canonical date engine ensuring 100% consistent date presentation across cards and details pages.
- **Functions**: `formatRelativePostingDate()`, `formatFullDate()`.

### 4. `apps/web/src/components/jobs/JobCard.tsx`
- **Purpose**: Visual card representing an individual job opportunity.
- **Displays**: Company avatar, title, location, work mode pill, experience chip, skills tags, relative posting time, and apply button.

### 5. `apps/web/src/components/jobs/JobResultsHeader.tsx`
- **Purpose**: Results header bar hosting the live job counter, Date Range dropdown (`30d`, `24h`, `3d`, `7d`, `14d`, `all`), and Sort dropdown (`postedAt`, `company`, `title`).

### 6. `apps/web/src/hooks/useJobs.ts`
- **Purpose**: Custom React hook managing API query state, loading flags, error handling, and memoized re-fetching.
