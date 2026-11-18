# Document 14: Technical Decisions, Trade-Offs & Real Engineering Challenges — Fresher Jobs India

## Executive Summary & Architectural Rationale

Every architectural decision in Fresher Jobs India was made to balance **data accuracy**, **development velocity**, **system maintainability**, and **runtime cost efficiency**. 

This document analyzes the primary engineering decisions using the structured framework:
$$\mathbf{Problem} \longrightarrow \mathbf{Options} \longrightarrow \mathbf{Chosen\ Approach} \longrightarrow \mathbf{Reason} \longrightarrow \mathbf{Trade-off}$$

---

## 1. Primary Architectural Decisions

### Decision 1: Python for Ingestion vs. Node.js
- **Problem**: Need to collect, parse, sanitize, and validate messy unstructured HTML and JSON payloads from 10+ disparate job boards and ATS portals.
- **Options**:
  1. Write the scraper in Node.js (TypeScript) alongside the API.
  2. Write the scraper in Python 3.13 using dedicated data-engineering libraries.
- **Chosen Approach**: Python 3.13 with `httpx`, `beautifulsoup4`, `pydantic`, and `psycopg`.
- **Reason**: Python offers the industry standard ecosystem for web parsing, string sanitization, and Pydantic schema validation. It simplifies mathematical text processing and connects effortlessly with AI SDKs.
- **Trade-off**: Requires running two runtimes (Python virtualenv and Node.js) rather than a single unified Node stack.

### Decision 2: NestJS for REST API vs. FastAPI / Express
- **Problem**: Need an enterprise-grade, strongly typed REST API with robust dependency injection, runtime DTO validation, and modular architecture.
- **Options**:
  1. Express.js (minimalist, unopinionated).
  2. FastAPI in Python (shares runtime with ingestion).
  3. NestJS (TypeScript, opinionated, Angular/Spring-like architecture).
- **Chosen Approach**: NestJS 10.4 with Prisma ORM.
- **Reason**: NestJS forces strict structural discipline through Modules, Services, and Controllers. It features built-in `ValidationPipe` with `class-validator`, making request validation declarative and robust. It completely isolates client-facing read traffic from background batch ingestion spikes.
- **Trade-off**: Steeper learning curve and higher boilerplate compared to minimalist Express or FastAPI.

### Decision 3: Next.js 16 App Router vs. Vite SPA
- **Problem**: Need a fast, responsive, SEO-friendly job portal with instant faceted filtering.
- **Options**:
  1. Vite + React Single Page Application (client-side only).
  2. Next.js 16 with App Router and Turbopack compiler.
- **Chosen Approach**: Next.js 16 App Router.
- **Reason**: Static generation (`○`) of base shells and pre-rendering provides sub-50ms TTFB. Turbopack provides lightning-fast local compilation. Next.js App Router easily supports dynamic server routes (`/jobs/[id]`) for rich social meta tags and future SEO indexing.
- **Trade-off**: Increased build complexity with server/client boundaries (`'use client'`).

### Decision 4: PostgreSQL + Prisma vs. MongoDB / NoSQL
- **Problem**: Storing job listings, companies, sources, classifications, and audit logs.
- **Options**:
  1. MongoDB / Document Store (flexible schema, easy storage of irregular job fields).
  2. PostgreSQL 16 with Prisma ORM (relational, strict constraints, B-tree indexes).
- **Chosen Approach**: PostgreSQL 16 relational store.
- **Reason**: Job data is inherently relational (`Company 1:N Job`, `Source 1:N Job`, `Job 1:1 Classification`). Relational constraints guarantee deduplication via unique compound keys (`[sourceId, externalId]`, `[canonicalUrl]`). Composite B-tree indexes provide predictable sub-20ms queries for complex multi-column filters (`WHERE status = 'ACTIVE' AND indiaEligibility = 'VERIFIED_INDIAN' AND postedAt >= cutoff`).
- **Trade-off**: Schema modifications require formal migration scripts (`prisma migrate`).

### Decision 5: Gemini 2.5 Flash vs. Pure Regex vs. Local LLMs
- **Problem**: Categorizing arbitrary job titles into standardized roles and extracting technical skills.
- **Options**:
  1. Pure Regular Expressions (fast, free, but brittle and fails on novel titles).
  2. Local Open-Source LLM (e.g. Llama 3 running on local GPU; private, but high hardware cost).
  3. Google Gemini 2.5 Flash via official GenAI API.
- **Chosen Approach**: Google Gemini 2.5 Flash with Pydantic JSON schema validation.
- **Reason**: Extremely fast inference (< 1.5s), state-of-the-art semantic reasoning, native structured JSON output, and ultra-low pricing ($0.05 per 1,000 jobs).
- **Trade-off**: Subject to external API availability, network latency, and free tier rate limits (5 RPM / 20 RPD).

### Decision 6: Deterministic India Validation alongside Generative AI
- **Problem**: Ensuring 100% of published jobs are genuinely in India without allowing AI hallucinations or ambiguous worldwide remote jobs to slip through.
- **Options**:
  1. Let the LLM decide if the job is in India.
  2. Implement a strict, deterministic regex and keyword rule matrix before the LLM.
- **Chosen Approach**: Deterministic Geographic Matrix (`india_eligibility.py`) as the primary gatekeeper.
- **Reason**: LLMs are probabilistic engines and can make confident mistakes (e.g., assuming a job at a US company with headquarters in San Francisco is US-only when the office is in Bengaluru, or vice versa). A deterministic rule matrix evaluating city names, states, pin codes, and country codes guarantees 100% precision.
- **Trade-off**: Requires maintaining an explicit dictionary of Indian tech hubs and aliases.

### Decision 7: Separation of Canonical `postedAt` from Ingestion Timestamps
- **Problem**: Naive scrapers stamp newly discovered jobs with `datetime.now()`, causing 9-month-old postings to appear at the top of the "Newest" feed as "Today".
- **Options**:
  1. Use database `createdAt` as the posting date.
  2. Enforce a six-tier date hierarchy preserving the official employer publication timestamp in `postedAt`.
- **Chosen Approach**: Canonical Date Hierarchy (`postedAt`, `sourceUpdatedAt`, `firstSeenAt`, `lastSeenAt`, `createdAt`).
- **Reason**: Solves the core user trust issue. Job seekers are not deceived by outdated listings branded as fresh.
- **Trade-off**: When an external source does not provide a publication timestamp, `postedAt` must be set to `NULL` and excluded from the default fresh feed.

---

## 2. Real Engineering Challenges & How They Were Overcome

### Challenge 1: The "Everything Posted Today" Date Corruption Bug
- **Discovery**: Forensic analysis showed 157 jobs originally published on March 8, 2026 had today's timestamp because `github_india.py` executed `posted_at = datetime.now()`.
- **Resolution**:
  1. Modified `github_india.py` to parse official `date_posted` and `first_seen` from `Sarthzk/internship-tracker`.
  2. Built and executed `ingestion/backfill_dates.py` to revert the 157 records back to their authentic March 8, 2026 timestamps without deleting any rows.
  3. Added the `FreshnessStatus` module (`freshness.py`) and a comprehensive unit test suite (`test_date_freshness.py`).

### Challenge 2: Gemini Rate Limiting (HTTP 429) Halting Ingestion
- **Discovery**: When testing ingestion across 50 companies, Gemini 2.5 Flash returned `429 RESOURCE_EXHAUSTED` due to the Free Tier ceiling (20 requests per day), crashing the pipeline mid-execution.
- **Resolution**:
  1. Refactored the pipeline so that collection, validation, normalization, deduplication, and PostgreSQL persistence occur first.
  2. Integrated a circuit-breaker in `ai_classifier.py`: when a daily quota error is detected, the classifier logs a warning and yields gracefully.
  3. The unclassified jobs remain saved in PostgreSQL with `status = 'PENDING'` and are displayed on the frontend with baseline metadata.

### Challenge 3: Prisma Schema Drift & Interactive Reset Prompts
- **Discovery**: Running `pnpm db:migrate` triggered `Drift detected: We need to reset the public schema. All data will be lost. (y/N)` because columns were added via `db push` without a migration file.
- **Resolution**:
  1. Authored the SQL migration file: `20261117103000_add_canonical_dates/migration.sql`.
  2. Resolved the migration status using `prisma migrate resolve --applied 20261117103000_add_canonical_dates`.
  3. Database schema was brought up to date with zero data loss, preserving all 501 active verified jobs.
