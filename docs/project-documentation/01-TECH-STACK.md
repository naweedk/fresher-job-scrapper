# Document 01: Technology Stack & Justification — Fresher Jobs India

## Executive Summary & Stack Matrix

| Layer | Technology | Exact Version | Primary Role & Responsibility |
| :--- | :--- | :--- | :--- |
| **Ingestion Engine** | Python | `3.13.2` | Data extraction, web scraping, normalization, deduplication, and database persistence |
| **HTTP Client (Python)** | HTTPX | `0.28.1` | Asynchronous/Synchronous HTTP client for calling external ATS REST APIs |
| **Parsing & Scraping** | BeautifulSoup4 | `4.13.4` | HTML stripping, Atom XML parsing, and unstructured text sanitization |
| **Schema Validation (Python)**| Pydantic / Settings | `2.10.4` / `2.7.0` | Runtime validation of raw collector payloads, normalized entities, and env vars |
| **Database Driver (Python)** | Psycopg | `3.2.3` | High-performance binary PostgreSQL driver with parameterized query execution |
| **Generative AI** | Google GenAI SDK | `gemini-2.5-flash` (`>=3.3.0`) | Automated entity extraction, role categorization, skill extraction, and confidence scoring |
| **Testing (Python)** | Pytest / Pytest-Asyncio | `8.3.4` / `0.25.0` | Test suite covering collectors, freshness, India eligibility, and AI prompts |
| **Database Engine** | PostgreSQL | `16-alpine` (Docker) | Primary relational database with ACID guarantees, JSONB support, and B-tree indexes |
| **Backend Framework** | NestJS | `10.4.15` | Enterprise Node.js TypeScript REST framework with dependency injection and modular design |
| **ORM & Migrations** | Prisma ORM | `5.22.0` | Declarative schema modeling, type-safe query generation, and migration tracking |
| **API Validation** | Class-Validator / Transformer | `0.14.1` / `0.5.1` | DTO parameter validation, numeric parsing, and whitelist filtering |
| **Backend Testing** | Jest / Ts-Jest | `29.7.0` / `29.4.15` | Mocked unit tests for controllers and service query construction |
| **Frontend Framework** | Next.js | `16.4.6` (App Router) | React Server Components, Turbopack compiler, static generation, dynamic client routing |
| **UI Library** | React | `19.3.0` | Declarative component UI engine with modern hooks (`useActionState`, `use`) |
| **Component System** | Material UI (MUI) / Icons | `9.5.0` (v6) | Pre-built accessible components, theme customization, and professional typography |
| **CSS-in-JS Engine** | Emotion React / Styled | `11.14.0` / `11.14.1` | SSR-compatible styled components and dynamic sx prop styling |
| **Package Manager** | PNPM | `11.0.9` | Fast, disk space-efficient monorepo dependency management via hard links |
| **Containerization** | Docker / Compose | `20+` / Compose v2 | Local containerized PostgreSQL isolation running on custom port `5434` |
| **CI/CD Automation** | GitHub Actions | Ubuntu Latest | Scheduled daily ingestion cron at 06:00 UTC with automated migration deployment |

---

## 1. Python 3.13 for Data Ingestion

### Simple Explanation
When building web scrapers, data parsers, and API collectors, Python is the gold standard because of its massive ecosystem of data processing libraries (like BeautifulSoup and Pydantic) and its clean syntax for writing transformation pipelines. Python 3.13 provides modern type hints and significant speed improvements, making it effortless to parse 6,000+ jobs from external APIs in seconds.

### Technical Explanation
Data engineering pipelines require robust string manipulation, regex evaluation, XML/HTML parsing, and structured schema transformations. Python was selected because:
1. **Rich Parsing Ecosystem**: Native integration with `beautifulsoup4` for HTML cleanup, standard `xml.etree.ElementTree` for RSS/Atom feeds, and `httpx` for modern HTTP/2-ready network transport with SSL verification and connection pooling.
2. **Schema Enforcement via Pydantic v2**: Pydantic models compile under Python's Rust core, providing ultra-fast serialization and type coercions from dirty JSON payloads into strongly typed objects (`RawJob`, `NormalizedJob`).
3. **Low-Overhead Database Connectivity**: `psycopg` (version 3) provides native C-binary bindings, connection context managers, dictionary-row factories, and parameter-safe batch execution, avoiding the memory overhead of a heavy Node ORM during large batch ingestion runs.
4. **Alternative Considered**: Writing the scraper in Node.js (TypeScript). 
   - *Why rejected*: Node scrapers often suffer from memory bloat when parsing large multi-megabyte XML/JSON responses and lack the mature data wrangling libraries available in Python.

---

## 2. NestJS (Node.js 20+) for the Backend API

### Simple Explanation
While Python is fantastic for scraping data, NestJS is designed specifically for building large, maintainable enterprise web APIs. Think of NestJS like Angular or Spring Boot for Node.js: it forces you to organize your code into clean folders (Controllers, Services, Modules) and automatically checks that incoming user requests have valid data before they ever hit the database.

### Technical Explanation
The REST API layer is built on NestJS 10 running on Node.js 20. Key engineering justifications:
1. **Modular Architecture & Dependency Injection**: NestJS implements IoC (Inversion of Control) and DI (Dependency Injection), allowing controllers (`JobsController`, `StatsController`) to remain decoupled from data access logic (`JobsService`). This makes unit testing trivial using mock providers without touching a real database.
2. **Validation Pipeline**: Incoming query parameters (`QueryJobsDto`) are strictly validated at the runtime boundary using `class-validator` decorators (`@IsOptional`, `@IsEnum`, `@Type(() => Number)`). Invalid input is rejected with clean 400 Bad Request responses before reaching query execution.
3. **Separation of Concerns**: Ingestion (an asynchronous, scheduled background workload) is cleanly separated from the REST API (a synchronous, low-latency client-facing workload). If ingestion runs into a heavy memory spike or Gemini rate limit, the REST API remains 100% responsive.
4. **Alternative Considered**: FastAPI in Python.
   - *Why rejected*: Combining API and ingestion in a single Python monolith introduces concurrency bottlenecks with Python's GIL during simultaneous scraping and API serving, and creates a mixed codebase where frontend TypeScript developers cannot easily contribute to backend DTOs.

---

## 3. PostgreSQL 16 & Prisma ORM

### Simple Explanation
Jobs are structured relational data: a **Job** belongs to a **Company**, comes from a **Source**, and has an **AI Classification**. PostgreSQL is the most reliable relational database in the world, guaranteeing that data is never lost or corrupted. Prisma acts as a bridge between NestJS and PostgreSQL, writing type-safe SQL queries for us and ensuring we never make typos in column names.

### Technical Explanation
1. **Relational Guarantees**: Relational integrity is enforced using foreign keys with `ON DELETE CASCADE` or `RESTRICT`. Duplicate prevention is enforced at the database layer via composite unique constraints (`[sourceId, externalId]` and `[canonicalUrl]`).
2. **Indexing Strategy**: B-Tree composite indexes are configured on frequently queried columns:
   - `@@index([status, indiaEligibility, postedAt])` enables index-only scans for the primary home feed.
   - `@@index([companyId])` and `@@index([sourceId])` optimize relational joins.
3. **Prisma Type Safety**: Prisma generates TypeScript definitions directly from `schema.prisma`. Any column rename or type mismatch triggers a compile-time TypeScript error, eliminating runtime SQL bugs.
4. **Dual Interaction Model**:
   - NestJS uses Prisma for typed application reads and transaction handling.
   - Python uses parameterized raw SQL via `psycopg` for maximum throughput during bulk upsert operations (`ON CONFLICT (sourceId, externalId) DO UPDATE...`).

---

## 4. Google Gemini 2.5 Flash for AI Classification

### Simple Explanation
Job descriptions written by recruiters are messy: one company says "Software Development Intern", another says "SDE Intern - Summer 2026", and another says "Junior Fullstack Apprentice". We use Google's Gemini 2.5 Flash AI model to read the job title and description, figure out the actual role (e.g. "Software Engineer"), extract the specific technologies required (e.g. "Python, Docker"), and confirm the city in India.

### Technical Explanation
1. **Cost & Latency Efficiency**: `gemini-2.5-flash` offers state-of-the-art reasoning at sub-second response times and ultra-low pricing ($0.075 per million input tokens, $0.30 per million output tokens), making it 10x more cost-efficient than GPT-4o while outperforming smaller open-source models on unstructured NER (Named Entity Recognition).
2. **Structured JSON Output**: Using `response_mime_type="application/json"` and strict Pydantic parsing (`ClassificationResult`), Gemini returns deterministic JSON adhering to predefined enums (`RoleCategory`, `IndianCity`, `JobType`, `ExperienceLevel`).
3. **Decoupled Fallback**: The pipeline handles AI failure gracefully. If Gemini returns 429 (Resource Exhausted) or 503 (High Demand), the job is saved with `status = PENDING`. The application never crashes, and the jobs remain searchable.
4. **Alternative Considered**: Regex-only classification or local HuggingFace BERT models.
   - *Why rejected*: Regex fails on novel terminology (e.g., distinguishing "Frontend React Intern" from "React Native Mobile Dev"), while local LLMs require costly GPU infrastructure.

---

## 5. Next.js 16 (React 19) App Router for Frontend

### Simple Explanation
Next.js is the premier React framework for building production websites. By using the App Router and Turbopack compiler, pages load almost instantaneously. It allows us to render pages on the server for speed and SEO, while providing an interactive, app-like experience when filtering and searching for jobs without refreshing the browser.

### Technical Explanation
1. **Next.js 16 App Router Architecture**: Uses React 19 Server Components for base layouts and client components for interactive search filters (`useJobs` hook with deep param memoization).
2. **Turbopack Compiler**: Compiles TypeScript and JSX in milliseconds, reducing build times from minutes to seconds (`next build` completes in < 15 seconds).
3. **Material UI (MUI v6) Theme Architecture**: Implements a customized enterprise design token palette (`#0a66c2` primary blue, subtle slate borders `#e2e8f0`, Inter typography) optimized for Indian job discovery.
4. **Mobile-First Responsive Layout**: Features dynamic drawer filters on mobile screens and sticky desktop sidebars on large viewports (`Container maxWidth="xl"`).

---

## 6. Monorepo Architecture with PNPM Workspaces

### Repository Layout
```
fresher-job-scrapper/
├── apps/
│   ├── api/            # NestJS 10 REST API
│   └── web/            # Next.js 16 Frontend Client
├── ingestion/          # Python 3.13 ETL Engine & AI Pipeline
├── docs/               # System documentation & architectural guides
├── docker-compose.yml  # Local PostgreSQL 16 service
├── package.json        # Root workspace script runner
└── pnpm-workspace.yaml # Monorepo workspace configuration
```

### Justification
- **Shared Type Definitions**: Shared mental models between frontend and API.
- **Single Command Orchestration**: Running `pnpm dev` executes both frontend and backend concurrently using `concurrently`.
- **Isolated Environments**: Python maintains its own isolated virtual environment (`ingestion/venv`), preventing Node and Python dependency conflicts.
