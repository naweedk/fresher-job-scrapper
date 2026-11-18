# Document 18: Comprehensive Technical Glossary — Fresher Jobs India

## Executive Summary & Guide Structure

This glossary provides dual-level definitions for all core technical terms, data engineering patterns, and backend concepts used in Fresher Jobs India. 

Every entry contains:
- **Simple Explanation**: Intuitive, plain-English breakdown.
- **Technical Explanation**: Rigorous engineering terminology for senior technical interviews.
- **Project Example**: Exact reference to where and how the concept is implemented in this codebase.

---

## 1. Core Architectural & Backend Terms

### API (Application Programming Interface)
- **Simple**: A digital waiter that takes orders from a customer (frontend) and brings back food from the kitchen (backend database).
- **Technical**: A defined set of protocols, routines, and endpoints enabling programmatic communication and data interchange between distinct software subsystems over a network.
- **Project Example**: The NestJS API listening at `http://localhost:3100/api` providing data to the Next.js frontend.

### REST (Representational State Transfer)
- **Simple**: A standardized set of rules for building web services using standard HTTP actions like GET to read data and POST to save data.
- **Technical**: An architectural style for networked hypermedia systems that relies on stateless communication, uniform resource identifiers (URIs), standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), and standard representations (typically JSON).
- **Project Example**: `GET /api/jobs` retrieves resources; `GET /api/jobs/:id` targets a specific resource by primary key.

### DTO (Data Transfer Object)
- **Simple**: A strict packing slip that checks that incoming data has the right shape, types, and values before letting it into the application.
- **Technical**: An object that encapsulates data and specifies how it will be sent over the network. In NestJS, DTOs combine TypeScript class definitions with `class-validator` decorators to enforce runtime validation and type coercion.
- **Project Example**: `QueryJobsDto` (`apps/api/src/jobs/dto/query-jobs.dto.ts`), which validates that `limit` is an integer between 1 and 100.

### ORM (Object-Relational Mapping)
- **Simple**: A translator that lets developers interact with a database using programming language objects instead of writing raw SQL strings.
- **Technical**: A programming technique that maps incompatible type systems between relational databases and object-oriented programming languages, generating type-safe queries and managing relational lifecycles.
- **Project Example**: **Prisma ORM** (`@prisma/client`), which converts TypeScript calls like `prisma.job.findMany()` into optimized PostgreSQL queries.

---

## 2. Database & Persistence Terms

### Primary Key (PK)
- **Simple**: A unique identifier (like an Aadhaar number) that guarantees no two rows in a table can ever be confused.
- **Technical**: A column or combination of columns whose values uniquely identify each row in a relational database table, enforcing entity integrity and automatically indexed with a unique B-tree.
- **Project Example**: The `id` column on `jobs`, generated as a unique collision-resistant CUID string (e.g. `cm3kr81abc000108l9g71p49k`).

### Foreign Key (FK)
- **Simple**: A reference link in one table that points directly to a record in another table.
- **Technical**: A referential constraint between two tables. A foreign key in a child table identifies a column that references the primary key in a parent table, establishing referential integrity.
- **Project Example**: `jobs.companyId` references `companies.id` with `ON DELETE RESTRICT` (preventing accidental deletion of a company that has active jobs).

### B-Tree Index
- **Simple**: An alphabetical index at the back of a textbook that lets you find a specific topic in seconds without reading every page.
- **Technical**: A self-balancing search tree data structure that maintains sorted data and allows logarithmic time (`O(log n)`) searches, sequential access, insertions, and deletions.
- **Project Example**: `@@index([postedAt])` and `@@index([indiaEligibility])` in `apps/api/prisma/schema.prisma`, enabling sub-18ms queries over 12,000+ total rows.

### Upsert
- **Simple**: An intelligent save operation: "Insert this job if it's new; if it already exists, update its existing record."
- **Technical**: An atomic database operation combining `UPDATE` and `INSERT`. If a unique constraint or primary key collision occurs, the database executes an `UPDATE` statement rather than raising an integrity violation error.
- **Project Example**: `ON CONFLICT ("sourceId", "externalId") DO UPDATE SET "lastSeenAt" = NOW()` in `ingestion/database/job_repository.py`.

### Migration
- **Simple**: A version-controlled record of changes made to the database structure over time, similar to git commits for database tables.
- **Technical**: A programmatic, repeatable script modifying the schema of a relational database (creating tables, altering columns, adding indexes) that can be applied consistently across development, staging, and production.
- **Project Example**: `apps/api/prisma/migrations/20261117103000_add_canonical_dates/migration.sql`.

---

## 3. Data Engineering & Ingestion Terms

### Ingestion (ETL: Extract, Transform, Load)
- **Simple**: The automated process of collecting messy data from the outside world, cleaning it, and filing it neatly into your database.
- **Technical**: The three-phase data integration process: extracting raw data from heterogeneous sources, transforming it through validation and normalization pipelines, and loading it into a target data warehouse or transactional store.
- **Project Example**: `ingestion/pipeline.py` extracting from Greenhouse APIs, validating Indian eligibility in Python, and persisting to PostgreSQL.

### Deduplication
- **Simple**: Removing identical copies of the same job so a student doesn't see the same listing repeated ten times.
- **Technical**: The algorithmic identification and consolidation of duplicate records within or across datasets using deterministic composite keys, canonical URLs, or content hashing.
- **Project Example**: `url_normalizer.py` stripping tracking query parameters to ensure identical URLs map to a single database record.

### Normalization (Data Engineering)
- **Simple**: Converting different date styles, location names, and job titles into a single consistent format.
- **Technical**: The process of converting irregular, source-specific data representations into a standardized internal schema conforming to unified enums and type boundaries.
- **Project Example**: `normalizer.py` mapping various recruiter title strings and location aliases (e.g. "Bangalore" vs "Bengaluru") into a single canonical format.

### Idempotency
- **Simple**: Running a task once or ten times produces the exact same end result without creating duplicate data or corrupted state.
- **Technical**: The property of certain operations in mathematics and computer science whereby they can be applied multiple times without changing the result beyond the initial application ($f(f(x)) = f(x)$).
- **Project Example**: Running `python main.py --stage collect` twice in a row: the second run reports `Duplicates detected` and inserts 0 duplicate rows.

### Rate Limiting & Exponential Backoff
- **Simple**: Being a polite guest on someone else's website by waiting a moment between requests, and waiting longer if they say they are busy.
- **Technical**: Restricting the frequency of API requests over a given time window (e.g. 5 requests per minute) combined with an error-handling algorithm that progressively doubles the wait duration before retrying following a network or 429 response.
- **Project Example**: `BaseCollector.rate_limit_delay = 0.4s` and `ai_classifier.py` retrying 503 errors with progressive 1.0s and 2.0s delays.

---

## 4. Artificial Intelligence & LLM Terms

### LLM (Large Language Model)
- **Simple**: A massive neural network trained on vast amounts of text that can understand and generate human-like language.
- **Technical**: An autoregressive transformer-based deep neural network with billions of parameters capable of processing natural language prompts and generating probabilistically coherent responses.
- **Project Example**: Google's `gemini-2.5-flash` model used in `ingestion/processors/ai_classifier.py`.

### Prompt Engineering
- **Simple**: Crafting the exact words and instructions you give to an AI so it gives you the exact answer you want without guessing.
- **Technical**: The iterative process of structuring, contextualizing, and constraining natural language inputs to guide an LLM toward deterministic, schema-compliant outputs.
- **Project Example**: `ingestion/processors/classification_prompt.py`, which provides system instructions, role enums, and few-shot formatting rules.

### Token
- **Simple**: A small chunk of a word (about 4 characters) that an AI reads and writes.
- **Technical**: The fundamental unit of text processed by language models. Text is converted into numerical token embeddings by a tokenizer (e.g., Byte-Pair Encoding) before inference.
- **Project Example**: An average job prompt consumes ~450 input tokens and produces ~65 output tokens, costing ~$0.053 per 1,000 classifications.

### JSON Schema & Structured Output
- **Simple**: Forcing the AI to return data in rigid computer code (JSON) rather than writing conversational prose.
- **Technical**: Using model-level constraints (`response_mime_type="application/json"`) and grammar-guided decoding to guarantee that the LLM generates valid JSON matching a predefined schema.
- **Project Example**: `ClassificationResult` in `ingestion/schemas/__init__.py`.

### Confidence Score
- **Simple**: A score from 0% to 100% where the AI tells us how sure it is about its classification.
- **Technical**: A calibrated floating-point metric (0.00 to 1.00) quantifying the model's certainty regarding extracted entities, used by downstream systems to trigger manual review when falling below a quality threshold.
- **Project Example**: `job_classifications.confidence` stored as a `DOUBLE PRECISION` value in PostgreSQL.

---

## 5. Web, Frontend & Standard Terms

### UTC (Coordinated Universal Time) & ISO 8601
- **Simple**: The universal global clock that avoids confusion caused by different time zones.
- **Technical**: The primary international time standard. ISO 8601 represents timestamps in the format `YYYY-MM-DDTHH:MM:SS.sssZ`, where `Z` denotes UTC zero offset.
- **Project Example**: `postedAt` is strictly stored as UTC in PostgreSQL and formatted into Indian Standard Time (`en-IN`) on the client.

### Turbopack
- **Simple**: An ultra-fast Next.js build tool written in Rust that compiles web pages in milliseconds.
- **Technical**: An incremental, Rust-based bundler and build system integrated into Next.js 16, replacing Webpack to provide near-instantaneous hot-module replacement (HMR) and optimized static builds.
- **Project Example**: `next build` completing production optimization across all routes in < 15 seconds.
