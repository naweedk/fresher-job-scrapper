# Architecture Blueprint — Fresher Jobs India

## 1. System Architecture Overview

Fresher Jobs India follows a modular monorepo architecture separating the user presentation layer (Next.js), the core backend API and persistence layer (NestJS + Prisma + PostgreSQL), and an autonomous data collection and AI enrichment worker (Python Ingestion Engine).

```
   ┌────────────────────────────────────────┐
   │         Next.js Web (Port 3000)        │
   │  App Router • MUI • ThemeRegistry      │
   └───────────────────▲────────────────────┘
                       │ HTTP / REST
   ┌───────────────────▼────────────────────┐
   │        NestJS API (Port 3100)          │
   │  Global Validation • CORS • Prisma     │
   └───────────────────▲────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼─────────────────────┐  ┌──────▼─────────────────────┐
│  PostgreSQL Database       │  │  Python Ingestion Engine   │
│  Port 5434 • Prisma Schema │◄─┤  Pydantic • Collectors     │
│  Relational Integrity      │  │  Gemini AI Classification  │
└────────────────────────────┘  └────────────────────────────┘
```

---

## 2. Frontend Architecture (`apps/web`)

- **Framework**: Next.js 16 utilizing the App Router paradigm.
- **Rendering Model**: Server Component default with client hydration where required (`ThemeRegistry`, interactive components).
- **Styling & Design System**: Material UI (MUI 9) configured with `@mui/material-nextjs` for Next.js App Router style injection and emotion cache support.
- **Theme Centralization**:
  - Clean SaaS appearance with white/light backgrounds (`#F5F7FA`, `#FFFFFF`).
  - Professional primary blue accent (`#1565C0`).
  - Standardized Inter typography.
- **Resilience**:
  - `loading.tsx` providing suspended feedback.
  - `error.tsx` catching runtime exceptions with retry capability.

---

## 3. Backend Architecture (`apps/api`)

- **Framework**: NestJS 10 running on Node.js / Express.
- **Modularity**:
  - `HealthModule`: Live database verification (`SELECT 1` via Prisma).
  - `JobsModule`: REST endpoints for querying active listings.
  - `CompaniesModule`: Company profile aggregations.
  - `SourcesModule`: Ingestion source metadata.
  - `StatsModule`: Platform aggregation indicators.
  - `PrismaModule`: Global lifecycle-managed ORM connection.
- **Configuration & Security**:
  - `@nestjs/config` for structured environment loading.
  - Strict CORS configured to allow only the authorized frontend origin (`FRONTEND_URL`).
  - Global `ValidationPipe` with payload transformation and unknown key stripping (`whitelist: true`).

---

## 4. Database Architecture (`PostgreSQL + Prisma`)

### Entity-Relationship Diagram

```
┌────────────────┐          ┌────────────────────────┐
│     Source     │◄──┐      │        Company         │
│  (id, name,    │   │      │  (id, name, website,   │
│   sourceType)  │   │      │   logoUrl)             │
└───────┬────────┘   │      └───────────┬────────────┘
        │            │                  │
        │ 1:N        │ 1:N              │ 1:N
        │            │                  │
┌───────▼────────┐   │      ┌───────────▼────────────┐
│  IngestionLog  │   └──────┤          Job           │
│  (fetched,     │          │  (title, description,  │
│   inserted,    │          │   location, jobUrl,    │
│   duplicates)  │          │   canonicalUrl)        │
└────────────────┘          └───────────┬────────────┘
                                        │ 1:1
                            ┌───────────▼────────────┐
                            │   JobClassification    │
                            │  (role, city, jobType, │
                            │   workMode, skills)    │
                            └────────────────────────┘
```

### Uniqueness & Indexing Strategy
- **Null-Safe External Uniqueness**: `@@unique([sourceId, externalId])` guarantees no duplicate items from the same provider while permitting `NULL` external identifiers as distinct rows in PostgreSQL.
- **Optimized Lookups**: Indexes are explicitly maintained on `Job(title, location, status, postedAt, companyId, sourceId)` and `JobClassification(role, city, jobType)` for search queries.

---

## 5. Python Ingestion Architecture (`ingestion/`)

- **Design Pattern**: Command-line driven pipeline executing source adapters, normalization filters, and database sink.
- **Packages**:
  - `collectors/`: Source-specific crawlers (handling APIs, RSS, and structured HTML).
  - `processors/`: Normalization and deduplication engines.
  - `schemas/`: Pydantic V2 models for validation.
  - `database/`: Psycopg 3 connection pools and direct upsert statements.
- **Settings Management**: Pydantic `BaseSettings` reading environment configurations with automatic password masking in logs.

---

## 6. Planned Gen AI Classification Pipeline (Phase 2)

```
[Raw Ingested Job]
       │
       ▼
[Extraction & Normalization] ──> Strips HTML, parses dates, generates content hash
       │
       ▼
[Deduplication Check] ─────────> Check canonicalUrl & contentHash in DB
       │ (If New)
       ▼
[Gemini Structured Prompt] ────> Extracts { role, city, jobType, workMode, skills }
       │
       ▼
[Pydantic Validation] ─────────> Validates against ClassificationResult schema
       │
       ▼
[PostgreSQL Ingestion] ────────> Atomic transaction saving Job + JobClassification
```

---

## 7. Planned Daily Automation Pipeline (Phase 2 / 3)

1. **Trigger**: Scheduled cron job (e.g., daily at 02:00 IST).
2. **Execution**: Python ingestion runner executes all active collectors sequentially.
3. **Audit**: Each run logs metrics in `IngestionLog` (fetched, inserted, duplicates, failures).
4. **Staleness Check**: Jobs older than 45 days or returning HTTP 404/410 marked `EXPIRED`.
