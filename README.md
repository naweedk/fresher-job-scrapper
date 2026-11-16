# Fresher Jobs India

A production-grade, full-stack job aggregation platform designed to collect, deduplicate, intelligently classify with Gen AI, and deliver genuine entry-level and internship opportunities across India from permitted public sources.

---

## 1. Project Overview & Problem Statement

### The Problem
Finding authentic entry-level and fresher jobs in India is hindered by noise, misleading experience requirements (e.g., "entry level" jobs requiring 2–3 years of experience), expired listings, and fragmented platforms. Freshers and interns spend hours navigating cluttered job boards with conflicting data.

### The Objective
Fresher Jobs India solves this through a robust 3-tier architecture:
1. **Data Ingestion & Deduplication**: Python pipeline collecting thousands of jobs from permitted public sources (Arbeitnow, Remotive, Jobicy, RemoteOK, GitHub Jobs), enforcing canonical URL normalization and SHA-256 content hashing to eliminate duplicates.
2. **AI Classification**: Google Gemini LLM categorizes jobs strictly into standardized roles, normalized Indian cities, job types, experience tiers, work modes, and extracted technical skills.
3. **Search & Discovery Platform**: NestJS REST API with indexed search, multi-faceted filtering, sorting, and pagination, paired with a modern Next.js 16 (App Router) + Material UI (MUI 9) frontend.
4. **Automated Daily Ingestion**: GitHub Actions workflow running on a daily schedule (`06:00 UTC`) to continuously discover new opportunities.

---

## 2. Current Status: Phase 3 Complete

The project has completed **Phase 1 (Foundation)**, **Phase 2 (Ingestion & AI)**, and **Phase 3 (Search, Discovery & Frontend)**.

- [x] **Database & Monorepo**: PostgreSQL 16 on Docker (port 5434) with Prisma ORM 5. 8,763 active jobs, 2,315 companies, 5 active sources persisted.
- [x] **Backend API (NestJS 10)**:
  - `GET /api/jobs`: Search across title/description/company, filter by role, city, jobType, experienceLevel, workMode, skills, sort by postedAt, title, company, createdAt, with paginated metadata.
  - `GET /api/jobs/:id`: Full job view including company, source, and AI classification.
  - `GET /api/jobs/filters`: Dynamic aggregation of distinct roles, cities, and job types.
  - `GET /api/stats`: Real-time system metrics (total/active jobs, companies, sources, classifications breakdown).
- [x] **Frontend Web App (Next.js 16 + React 19 + MUI 9)**:
  - Responsive homepage with live platform metrics, debounced search (400ms), multi-filter sidebar (desktop) and bottom drawer (mobile), job cards grid, sorting dropdown, and pagination.
  - Job detail page (`/jobs/[id]`) with company info, classification badge, formatted description, required skills chips, and outbound application link.
  - About page (`/about`) detailing the pipeline architecture and assignment context.
  - Custom 404 page (`/not-found`) with recovery navigation.
  - Complete empty, loading skeleton, and error state handling.
- [x] **Tests & Quality**:
  - NestJS backend unit tests: 23/23 tests passing (`pnpm --filter api test`).
  - Python ingestion test suite: 24/24 tests passing (`pytest ingestion/tests/ -v`).
  - ESLint: 0 errors, 0 warnings across all monorepo packages (`pnpm lint`).
  - TypeScript & Production builds: Both `api` and `web` build cleanly.
- [x] **Automation**: Daily scheduled GitHub Actions workflow (`.github/workflows/daily-ingestion.yml`).

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16.4 (App Router), React 19, TypeScript strict mode, Material UI (MUI 9.5), Emotion, `@mui/material-nextjs` |
| **Backend** | NestJS 10.4, TypeScript strict mode, Express, Class-Validator, Class-Transformer, Prisma ORM 5.22, Jest |
| **Database** | PostgreSQL 16 (Alpine), Docker Compose, Prisma Schema & Migrations |
| **Ingestion** | Python 3.13, Virtualenv, Pydantic 2, HTTPX, Requests, BeautifulSoup4, Psycopg 3, Pytest |
| **AI Layer** | Google Gemini API (`gemini-2.5-flash`), structured JSON response schema |
| **CI / Scheduling** | GitHub Actions (`daily-ingestion.yml`), Cron (`0 6 * * *`) |
| **Tooling** | pnpm 11 workspace, Docker Compose, Git |

---

## 4. Architecture & Monorepo Structure

```text
Fresher Job Scrapper/
│
├── apps/
│   ├── web/                          # Next.js 16 Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages (/, /jobs/[id], /about, /not-found)
│   │   │   ├── components/
│   │   │   │   ├── common/           # LoadingState, EmptyState, ErrorState
│   │   │   │   ├── jobs/             # JobCard, JobList, JobFilters, JobSearch, JobSort, JobPagination
│   │   │   │   ├── layout/           # Header, Footer
│   │   │   │   └── stats/            # PlatformStats metrics cards
│   │   │   ├── hooks/                # useJobs, useJobFilters
│   │   │   ├── services/             # jobs.service, stats.service
│   │   │   ├── theme/                # MUI theme & ThemeRegistry
│   │   │   └── types/                # TypeScript API contracts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                          # NestJS 10 Backend
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── migrations/           # Migration history
│       ├── src/
│       │   ├── common/               # Health checks, filters
│       │   ├── config/               # Environment configuration
│       │   ├── jobs/                 # Jobs search, filter, detail module & spec tests
│       │   ├── companies/            # Company profiles module
│       │   ├── sources/              # Ingestion sources module
│       │   ├── stats/                # Metrics calculation module
│       │   └── prisma/               # PrismaService connection manager
│       ├── package.json
│       └── tsconfig.json
│
├── ingestion/                        # Python Ingestion Pipeline
│   ├── collectors/                   # Source collectors (Arbeitnow, Remotive, Jobicy, RemoteOK, GitHub)
│   ├── processors/                   # Normalization, deduplication, Gemini AI classifier
│   ├── schemas/                      # Pydantic data models
│   ├── database/                     # PostgreSQL database client
│   ├── tests/                        # 24 Pytest unit & integration tests
│   ├── config.py                     # Ingestion settings
│   └── main.py                       # CLI entry point (--stage collect/classify/all)
│
├── docs/                             # Documentation
│   ├── api-reference.md              # REST API endpoint reference
│   ├── frontend-guide.md             # Frontend architecture & MUI patterns
│   ├── scheduling.md                 # Daily ingestion automation guide
│   ├── architecture.md               # System architectural blueprint
│   └── development-setup.md          # Local developer setup guide
│
├── .github/workflows/
│   └── daily-ingestion.yml           # Automated daily collection & migration
├── docker-compose.yml                # PostgreSQL container (port 5434)
├── package.json                      # Monorepo root scripts
├── pnpm-workspace.yaml               # Workspace configuration
└── .env.example                      # Environment variables template
```

---

## 5. Getting Started

### 1. Prerequisites
- **Node.js**: v20 or v22 LTS
- **pnpm**: v9+ (`npm install -g pnpm`)
- **Docker Desktop**: Running for PostgreSQL
- **Python**: v3.11+
- **Google Gemini API Key** (optional for running AI classification)

### 2. Configure Environment
```bash
# Copy root environment file
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Ensure `DATABASE_URL` in `.env` points to port `5434`:
```env
DATABASE_URL="postgresql://postgres:local_dev_password@localhost:5434/fresher_jobs?schema=public"
NEXT_PUBLIC_API_URL=http://localhost:3100/api
```

### 3. Start Database
```bash
pnpm db:up
```

### 4. Install Dependencies & Run Migrations
```bash
pnpm install
pnpm db:migrate
```

### 5. Start Development Servers
Run both frontend and backend concurrently:
```bash
pnpm dev
```
Or separately:
```bash
# Backend API (runs on http://localhost:3100/api)
pnpm dev:api

# Frontend (runs on http://localhost:3000)
pnpm dev:web
```

---

## 6. API Reference

All endpoints are prefixed with `/api`. For complete schemas, see [docs/api-reference.md](docs/api-reference.md).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check verifying database connectivity |
| `GET` | `/api/stats` | Aggregated platform metrics (counts, breakdowns) |
| `GET` | `/api/jobs/filters` | Distinct filter options (roles, cities, job types) |
| `GET` | `/api/jobs` | Paginated jobs search with multiple filters and sorting |
| `GET` | `/api/jobs/:id` | Full job details with company and classification |

### Example Search Query
```bash
curl "http://localhost:3100/api/jobs?search=engineer&role=QA+Engineer&jobType=FULL_TIME&sortBy=postedAt&sortOrder=DESC&page=1&limit=20"
```

---

## 7. Running Tests & Quality Checks

### Backend Unit Tests (Jest)
```bash
pnpm --filter api test
```
*Result: 23 passed, 23 total.*

### Python Ingestion Tests (Pytest)
```bash
# Windows
.\ingestion\venv\Scripts\python.exe -m pytest ingestion/tests/ -v

# macOS / Linux
pytest ingestion/tests/ -v
```
*Result: 24 passed, 24 total.*

### Code Quality & Linting
```bash
pnpm lint
```
*Result: 0 errors, 0 warnings across api and web.*

### Production Build
```bash
pnpm build
```

---

## 8. Data Ingestion & Daily Scheduling

The Python ingestion service can be run independently:

```bash
cd ingestion
# Activate virtual environment
venv\Scripts\activate   # Windows
# source venv/bin/activate # macOS/Linux

# Run collection only
python main.py --stage collect

# Run classification on up to 50 pending jobs
python main.py --stage classify --limit 50

# Run full pipeline
python main.py --stage all
```

Automated daily collection is managed via GitHub Actions:
- **Workflow**: `.github/workflows/daily-ingestion.yml`
- **Schedule**: Daily at 06:00 UTC
- **Graceful Quota Handling**: Classification errors or Gemini API quota exhaustion do not fail the pipeline; newly collected jobs remain in `PENDING` classification status and are immediately searchable via title and company name.
- See [docs/scheduling.md](docs/scheduling.md) for complete details.

---

## 9. Current Limitations & Notes

- **AI Classification Quota**: Out of 8,763 stored jobs, 3 are fully classified with Gemini AI; the remaining 8,760 jobs are in `PENDING` classification status due to free tier quota limitations. All jobs are displayed and searchable across title, location, and company.
- **Outbound Application URLs**: Every job card links directly to the genuine company or source job posting URL via "Apply on Company Website".
