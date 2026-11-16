# Fresher Jobs India

A production-oriented job aggregation platform designed to collect, deduplicate, and intelligently classify genuine entry-level and internship opportunities across India from permitted public sources.

> **Project Assessment Context**: Developed as a technical assessment for Beep's Gen AI & Engineering role.

---

## 1. Project Overview & Problem Statement

### The Problem
Finding entry-level and fresher jobs in India is characterized by noise, misleading experience requirements (e.g., "entry level" jobs requiring 2–3 years of experience), outdated listings, and fragmented sources. Genuine fresher jobs and internships are scattered across company career portals, public job boards, RSS feeds, and official notices.

### The Objective
Build a robust, production-ready aggregation system that:
1. **Aggregates**: Gathers 200+ fresher jobs and internships from permitted public sources.
2. **Normalizes & Deduplicates**: Cleans listings, creates canonical fingerprints, and eliminates duplicates across multiple platforms.
3. **Classifies with Gen AI**: Applies an LLM (Gemini) to categorize jobs strictly by normalized role, city, job type, work mode, and extracted skill requirements.
4. **Delivers**: Serves opportunities through a responsive, modern web interface with search and filters, backed by an automated daily refresh pipeline.

---

## 2. Implementation Status: Phase 1 (Foundation Only)

We have completed **Phase 1: Project Initialization and Foundation**. The system is completely established, verified locally, and configured for seamless transition into Phase 2.

- [x] Monorepo workspace initialized with `pnpm`
- [x] Frontend initialized with Next.js (App Router), TypeScript (strict mode), and Material UI (MUI)
- [x] Backend initialized with NestJS, modular structure, global validation, and live health verification
- [x] Local PostgreSQL database running via Docker Compose with health checks
- [x] Prisma ORM integration with complete schema models, enums, indexes, and initial migration applied
- [x] Python 3 ingestion virtual environment created with Pydantic settings, dependencies, and pytest test suite
- [x] Environment variable management configured with examples
- [x] Comprehensive documentation and setup guides

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript (strict), Material UI (MUI 9), Emotion, `@mui/material-nextjs` |
| **Backend** | NestJS 10, TypeScript (strict), Express, Class-Validator, Class-Transformer, Prisma ORM 5 |
| **Database** | PostgreSQL 16 (Alpine), Docker Compose, Prisma Schema & Migrations |
| **Ingestion** | Python 3.13, Virtualenv, Pydantic 2, Pydantic Settings, HTTPX, Requests, BeautifulSoup4, Psycopg 3, Pytest |
| **Tooling** | pnpm 11 workspace, Docker Compose, Git |

---

## 4. Monorepo Directory Structure

```text
fresher-jobs-india/
│
├── apps/
│   ├── web/                     # Next.js Frontend Application
│   │   ├── app/                 # App Router (layout, page, loading, error, ThemeRegistry)
│   │   ├── public/              # Static assets
│   │   ├── src/                 # Reusable modules
│   │   │   ├── components/      # UI components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── services/        # API service clients
│   │   │   ├── theme/           # MUI theme tokens
│   │   │   └── types/           # Shared UI TypeScript contracts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                     # NestJS Backend API
│       ├── src/
│       │   ├── common/          # Health checks, shared filters/interceptors
│       │   ├── config/          # Environment configuration
│       │   ├── jobs/            # Job management module
│       │   ├── companies/       # Company profiles module
│       │   ├── sources/         # Ingestion sources module
│       │   ├── stats/           # Platform metrics module
│       │   ├── prisma/          # PrismaService & lifecycle hooks
│       │   ├── app.module.ts    # Root application module
│       │   └── main.ts          # Entry point & bootstrap logic
│       ├── prisma/
│       │   ├── schema.prisma    # Canonical database schema
│       │   └── migrations/      # Migration history
│       └── package.json
│
├── ingestion/                   # Python Data Ingestion Service
│   ├── collectors/              # Source-specific crawlers & adapters (Phase 2)
│   ├── processors/              # Normalization & deduplication (Phase 2)
│   ├── schemas/                 # Pydantic data schemas
│   ├── database/                # Database persistence layer (Phase 2)
│   ├── tests/                   # Pytest test suite
│   ├── config.py                # Pydantic Settings configuration
│   ├── main.py                  # CLI entry point
│   ├── requirements.txt         # Python package dependencies
│   └── venv/                    # Virtual environment (gitignored)
│
├── docs/                        # Architectural and setup documentation
│   ├── architecture.md          # In-depth architectural blueprint
│   └── development-setup.md     # Step-by-step developer instructions
│
├── docker-compose.yml           # PostgreSQL container definition
├── package.json                 # Monorepo root scripts & dev dependencies
├── pnpm-workspace.yaml          # pnpm workspace definition
├── .env.example                 # Environment variable templates
├── .gitignore                   # Version control ignore rules
└── README.md                    # Project documentation
```

---

## 5. Prerequisites

Before running the project locally, ensure you have:
- **Node.js**: v20 or v22 LTS
- **pnpm**: v9+ (`corepack enable` or `npm install -g pnpm`)
- **Docker Desktop**: Running for PostgreSQL
- **Python**: v3.11+
- **Git**: Installed locally

---

## 6. Getting Started

### 1. Clone & Configure Environment
```bash
git clone <repo-url>
cd "Fresher Job Scrapper"

# Copy root environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp ingestion/.env.example ingestion/.env
```

### 2. Start PostgreSQL Container
```bash
pnpm db:up
```
*Note: The database runs on port `5434` by default to avoid conflict with existing PostgreSQL instances.*

### 3. Install Monorepo Dependencies
```bash
pnpm install
```

### 4. Run Database Migrations
```bash
pnpm db:migrate
```

### 5. Start Development Servers
You can start both backend and frontend concurrently:
```bash
pnpm dev
```
Or start them individually:
```bash
# Terminal 1: NestJS API (http://localhost:3100/api)
pnpm dev:api

# Terminal 2: Next.js Frontend (http://localhost:3000)
pnpm dev:web
```

---

## 7. Python Ingestion Environment

```bash
cd ingestion

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run environment smoke test
python main.py

# Run test suite
pytest tests/ -v
```

---

## 8. Root Development Scripts

| Command | Action |
|---|---|
| `pnpm dev` | Run Next.js (`apps/web`) and NestJS (`apps/api`) concurrently |
| `pnpm dev:web` | Run only the Next.js frontend dev server (`:3000`) |
| `pnpm dev:api` | Run only the NestJS backend dev server (`:3100`) |
| `pnpm build` | Build production artifacts for both web and api |
| `pnpm lint` | Run ESLint across all workspace packages |
| `pnpm db:up` | Start the local PostgreSQL Docker container |
| `pnpm db:down` | Stop the local PostgreSQL Docker container |
| `pnpm db:migrate`| Run Prisma migrations in development mode |
| `pnpm db:generate`| Re-generate Prisma Client types |
| `pnpm db:studio` | Open Prisma Studio GUI for database inspection |

---

## 9. Verification & Service Endpoints

- **Frontend Homepage**: [http://localhost:3000](http://localhost:3000)
- **API Status**: [http://localhost:3100/api](http://localhost:3100/api)
- **API Health Check**: [http://localhost:3100/api/health](http://localhost:3100/api/health)
  ```json
  {
    "status": "ok",
    "service": "fresher-jobs-api",
    "database": "connected"
  }
  ```

---

## 10. Roadmap: Planned Future Phases

- **Phase 2: Job Source Integration & AI Classification**
  - Implement source collectors for permitted portals and RSS feeds.
  - Implement deduplication engine with canonical URLs and content hashing.
  - Integrate Google Gemini LLM to classify role titles, standardize cities, work modes, and skills.
  - Ingest 200+ verified fresher jobs into PostgreSQL.
- **Phase 3: Search, Discovery & User Dashboard**
  - Searchable listings with filters (role, city, work mode, job type).
  - Clean MUI cards with drawer/detail views.
  - Automated cron scheduler for daily job aggregation.
