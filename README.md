# Fresher Jobs India

A production-grade, full-stack job aggregation and AI-enriched discovery platform specifically engineered to collect, verify, deduplicate, and deliver genuine entry-level and internship opportunities across India from official career portals and permitted public sources.

---

## 1. Project Overview & Core Value Proposition

Finding authentic entry-level engineering jobs in India is plagued by three major problems:
1. **Misleading Experience Filters**: Job boards frequently list roles requiring 3–5 years of experience under "entry level".
2. **Date Deception & Stale Listings**: Scrapers often stamp old listings with today's execution date, causing 9-month-old postings to appear as "Posted Today".
3. **Geographic Ambiguity**: Generic "Worldwide Remote" roles or US-only positions are exposed to Indian graduates without verification of Indian work authorization.

**Fresher Jobs India** solves these problems through:
- **Canonical Date Hierarchy**: Strict separation between official employer publication dates (`postedAt`), source modification dates (`sourceUpdatedAt`), discovery timestamps (`firstSeenAt`), and internal database telemetry. Zero synthetic dates.
- **Deterministic India-Only Verification**: Algorithmic geographic validation ensuring all published roles are either on-site in an Indian tech hub, hybrid, or explicitly remote within India. Overseas jobs (including US states like Indiana/Indianapolis) are strictly rejected.
- **Fresher Experience Enforcement**: Hard blacklists senior titles (Lead, Principal, Staff, 3+ yrs) while accepting freshers, interns, and 0–2 years experience.
- **Decoupled AI Classification**: Google Gemini 2.5 Flash extracts standardized roles, cities, and skill arrays with non-blocking graceful degradation under API quota ceilings.
- **Direct Official ATS Applications**: Outbound application links connect candidates directly to employer ATS portals (Workday, Greenhouse, Lever) without intermediaries.

---

## 2. Live Platform Status & Verification Telemetry

The platform is **fully implemented, tested, and verified** against live PostgreSQL storage:

- **Total Active Verified Indian Opportunities**: **`501` jobs** (Target of 300 surpassed by +201).
- **Genuine Fresh Listings (`postedAt <= 30 days`)**: **`201` jobs**.
- **Preserved Historical Audit Listings (`> 30 days`)**: **`300` jobs** (preserved for audit without date fabrication).
- **Jobs with Fabricated Dates (`postedAt = now()`)**: **`0` jobs**.
- **Python Ingestion & Processing Tests**: **`50 / 50` passed (100%)**.
- **NestJS API Service Unit Tests**: **`22 / 22` passed (100%)**.
- **Next.js Production Build**: **`5 / 5` pages compiled and prerendered cleanly (0 errors)**.

---

## 3. Technology Stack

| Layer | Technologies | Exact Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, Material UI (MUI v6), Emotion | `16.4.6` / `19.3.0` / `9.5.0` | Server-rendered shells, instant faceted search, responsive UI |
| **Backend** | NestJS, TypeScript, Class-Validator, Express | `10.4.15` / `5.7.2` | REST API, DTO validation, Dependency Injection |
| **ORM & Database** | PostgreSQL, Prisma ORM, Docker Compose | `16-alpine` / `5.22.0` | ACID storage, B-tree composite indexing, migration history |
| **Ingestion Engine** | Python, HTTPX, BeautifulSoup4, Pydantic v2, Psycopg | `3.13.2` / `0.28.1` / `2.10.4` | High-throughput web crawlers, normalization, deduplication |
| **Generative AI** | Google GenAI SDK, Gemini 2.5 Flash | `gemini-2.5-flash` (`>=3.3.0`)| Semantic role extraction, Indian city normalization, skill tagging |
| **CI / Scheduling** | GitHub Actions | `daily-ingestion.yml` | Automated daily ingestion cron (06:00 UTC = 11:30 AM IST) |
| **Monorepo** | PNPM Workspaces, Concurrently | `11.0.9` / `9.1.0` | Monorepo orchestration and dependency isolation |

---

## 4. Architecture & Monorepo Structure

```text
fresher-job-scrapper/
├── apps/
│   ├── web/                          # Next.js 16 Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages (/, /jobs/[id], /about, /not-found)
│   │   │   ├── components/           # JobCard, JobResultsHeader, JobSearchHeader, etc.
│   │   │   ├── hooks/                # useJobs, useJobFilters
│   │   │   ├── services/             # jobs.service.ts, api.ts
│   │   │   ├── theme/                # MUI theme token palette & registry
│   │   │   ├── types/                # TypeScript API contracts
│   │   │   └── utils/                # date.ts (canonical date engine)
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── api/                          # NestJS 10 REST API (Port 3100)
│       ├── prisma/
│       │   ├── schema.prisma         # Single source of truth database models
│       │   └── migrations/           # Version-controlled SQL migration history
│       ├── src/
│       │   ├── common/health/        # Liveness & database health checks
│       │   ├── jobs/                 # QueryJobsDto, JobsController, JobsService
│       │   ├── companies/            # Company lookup module
│       │   ├── sources/              # Ingestion sources module
│       │   ├── stats/                # Metrics calculation module
│       │   └── prisma/               # PrismaClient connection manager
│       ├── package.json
│       └── tsconfig.json
│
├── ingestion/                        # Python 3.13 ETL Engine
│   ├── collectors/                   # 10 Source Collectors (Greenhouse, Lever, GitHub, Hasjob, etc.)
│   ├── processors/                   # Normalization, India validation, Freshness, AI Classifier
│   ├── database/                     # Psycopg connection pool & repositories
│   ├── schemas/                      # Pydantic data schemas
│   ├── tests/                        # 50 unit tests across Python modules
│   ├── backfill_dates.py             # Historical date restoration utility
│   ├── main.py                       # CLI entry point
│   ├── pipeline.py                   # Master pipeline orchestrator
│   └── requirements.txt
│
├── docs/                             # Engineering documentation
│   └── project-documentation/        # 21 comprehensive technical guides & interview prep
├── .github/workflows/                # GitHub Actions daily refresh workflow
├── docker-compose.yml                # PostgreSQL 16 container service (Port 5434:5432)
├── package.json                      # Monorepo root script runner
└── pnpm-workspace.yaml               # Monorepo workspace configuration
```

---

## 5. Prerequisites & Local Environment Setup

### Required Software:
- **Node.js**: `20.x` or `22.x`
- **Python**: `3.13.x`
- **PNPM**: `11.x` (`npm install -g pnpm`)
- **Docker**: Docker Desktop with Compose v2
- **Git**: For version control

### 1. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
DATABASE_URL="postgresql://postgres:local_dev_password@localhost:5434/fresher_jobs?schema=public"
PORT=3100
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3100/api
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL=gemini-2.5-flash
```

---

## 6. Quick Start Guide

### Step 1: Start PostgreSQL Database Container
The database runs on isolated host port **`5434`** to avoid conflicts with existing PostgreSQL instances:
```bash
pnpm db:up
```

### Step 2: Install Dependencies & Run Database Migrations
```bash
# Install Node.js monorepo dependencies
pnpm install

# Run Prisma migrations to initialize PostgreSQL schema
pnpm db:migrate
```

### Step 3: Set Up Python Virtual Environment
```bash
# Create virtual environment in ingestion folder
python -m venv ingestion/venv

# Activate virtual environment
# Windows:
ingestion\venv\Scripts\activate
# Linux/macOS:
source ingestion/venv/bin/activate

# Install ingestion requirements
pip install -r ingestion/requirements.txt
```

### Step 4: Run Initial Ingestion (Fetch 300+ Verified Indian Jobs)
```bash
# Fetch from daily Indian internship tracker
python ingestion/main.py --stage collect --source github_india

# Fetch from top Greenhouse career boards in India (35 companies)
python ingestion/main.py --stage collect --source greenhouse --pages 35

# Fetch from Lever career boards in India
python ingestion/main.py --stage collect --source lever --pages 20

# Optional: Run AI classification on pending records
python ingestion/main.py --stage classify --limit 20
```

### Step 5: Start Frontend and Backend Development Servers
```bash
# Runs Next.js (port 3000) and NestJS (port 3100) concurrently
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 7. Running Tests & Quality Verification

```bash
# 1. Run Python Ingestion Test Suite (50 tests)
ingestion/venv/Scripts/pytest ingestion/tests/ -v

# 2. Run NestJS Backend Unit Tests (22 tests)
pnpm --filter api test

# 3. Test Production Web Build (Next.js Turbopack)
pnpm --filter web build

# 4. Verify Live Database Verified Jobs Count
node apps/api/test_verified_dates.js
```

---

## 8. Complete Technical Documentation Suite

Comprehensive engineering documentation, system design diagrams, and interview preparation materials are available in **[`docs/project-documentation/`](./docs/project-documentation/)**:

| Document | Topic | Description |
| :--- | :--- | :--- |
| **[`00-PROJECT-OVERVIEW.md`](./docs/project-documentation/00-PROJECT-OVERVIEW.md)** | Overview | Business problem, requirements, and functional scope. |
| **[`01-TECH-STACK.md`](./docs/project-documentation/01-TECH-STACK.md)** | Tech Stack | Complete technology matrix and architectural justifications. |
| **[`02-SYSTEM-ARCHITECTURE.md`](./docs/project-documentation/02-SYSTEM-ARCHITECTURE.md)** | Architecture | High-level system design, data flow, and Mermaid diagrams. |
| **[`03-FOLDER-STRUCTURE.md`](./docs/project-documentation/03-FOLDER-STRUCTURE.md)** | Codebase | File-by-file technical guide across all modules. |
| **[`04-DATABASE-DESIGN.md`](./docs/project-documentation/04-DATABASE-DESIGN.md)** | Database | PostgreSQL schema, B-tree composite indexes, and ER diagram. |
| **[`05-PYTHON-INGESTION-PIPELINE.md`](./docs/project-documentation/05-PYTHON-INGESTION-PIPELINE.md)** | Ingestion | 10 collectors, normalization, India gatekeeper, and upsert SQL. |
| **[`06-LLM-CLASSIFICATION.md`](./docs/project-documentation/06-LLM-CLASSIFICATION.md)** | AI Layer | Gemini 2.5 Flash, prompts, JSON schema, and token economics. |
| **[`07-NESTJS-BACKEND.md`](./docs/project-documentation/07-NESTJS-BACKEND.md)** | Backend | NestJS controllers, services, DTO validation, and queries. |
| **[`08-NEXTJS-FRONTEND.md`](./docs/project-documentation/08-NEXTJS-FRONTEND.md)** | Frontend | App Router, React 19, Material UI, and state memoization. |
| **[`09-API-REFERENCE.md`](./docs/project-documentation/09-API-REFERENCE.md)** | API Docs | Complete REST API reference with realistic JSON payloads. |
| **[`10-DATA-QUALITY-AND-FRESHNESS.md`](./docs/project-documentation/10-DATA-QUALITY-AND-FRESHNESS.md)** | Data Quality | Date corruption bug diagnosis and canonical date hierarchy. |
| **[`11-SCHEDULING-AND-DEPLOYMENT.md`](./docs/project-documentation/11-SCHEDULING-AND-DEPLOYMENT.md)** | Deployment | GitHub Actions cron workflow, Docker, and deployment blueprint. |
| **[`12-ERROR-HANDLING-AND-FAILURES.md`](./docs/project-documentation/12-ERROR-HANDLING-AND-FAILURES.md)** | Resilience | Failure scenarios, rate-limiting, and circuit breakers. |
| **[`13-SECURITY-AND-PERFORMANCE.md`](./docs/project-documentation/13-SECURITY-AND-PERFORMANCE.md)** | Performance | SQL injection prevention, CORS, and query optimization. |
| **[`14-TECHNICAL-DECISIONS-AND-CHALLENGES.md`](./docs/project-documentation/14-TECHNICAL-DECISIONS-AND-CHALLENGES.md)** | Decisions | Problem → Reason → Trade-off analysis of engineering decisions. |
| **[`15-SCALABILITY-AND-FUTURE-ROADMAP.md`](./docs/project-documentation/15-SCALABILITY-AND-FUTURE-ROADMAP.md)** | Scalability | Scaling roadmap from 1,000 to 1,000,000+ jobs. |
| **[`16-TESTING-AND-VERIFICATION.md`](./docs/project-documentation/16-TESTING-AND-VERIFICATION.md)** | QA & Tests | Detailed test execution results and coverage telemetry. |
| **[`17-INTERVIEW-PREPARATION.md`](./docs/project-documentation/17-INTERVIEW-PREPARATION.md)** | Interview Prep | 30s/1m/3m pitches, whiteboard script, and 20 scenario Q&As. |
| **[`18-TECHNICAL-GLOSSARY.md`](./docs/project-documentation/18-TECHNICAL-GLOSSARY.md)** | Glossary | Dual-level simple and technical definitions for all terms. |
| **[`19-PROJECT-WALKTHROUGH.md`](./docs/project-documentation/19-PROJECT-WALKTHROUGH.md)** | Demo Guide | Chronological live demonstration guide with speaking script. |
| **[`20-PROJECT-STATUS-AND-DELIVERABLES.md`](./docs/project-documentation/20-PROJECT-STATUS-AND-DELIVERABLES.md)** | Audit | Assessment deliverables audit with live database telemetry. |
| **[`INDEX.md`](./docs/project-documentation/INDEX.md)** | Master Index | Navigation hub and reading pathways for all personas. |

---

## 9. License

This project was developed for the Beep Gen AI & Engineering Assessment. All rights reserved.
