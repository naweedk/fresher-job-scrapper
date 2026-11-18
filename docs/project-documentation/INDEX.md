# Complete Documentation Index — Fresher Jobs India

## Executive Summary

Welcome to the technical documentation library for **Fresher Jobs India**. This repository contains 21 comprehensive, deeply researched engineering documents covering system design, data pipelines, database architecture, AI classification, API references, test verification, and interview preparation.

---

## 1. Recommended Reading Pathways

### Pathway A: Technical Interviewer / System Architect (Deep Technical Audit)
1. [`00-PROJECT-OVERVIEW.md`](./00-PROJECT-OVERVIEW.md) — Problem statement, business goals, and core differentiators.
2. [`01-TECH-STACK.md`](./01-TECH-STACK.md) — Technology justifications, version matrix, and architectural trade-offs.
3. [`02-SYSTEM-ARCHITECTURE.md`](./02-SYSTEM-ARCHITECTURE.md) — High-level diagrams, inter-service protocols, and component interaction.
4. [`04-DATABASE-DESIGN.md`](./04-DATABASE-DESIGN.md) — PostgreSQL ER diagram, indexes, constraints, and migration history.
5. [`05-PYTHON-INGESTION-PIPELINE.md`](./05-PYTHON-INGESTION-PIPELINE.md) — Crawlers, normalization, India validation matrix, and deduplication.
6. [`06-LLM-CLASSIFICATION.md`](./06-LLM-CLASSIFICATION.md) — Gemini 2.5 Flash integration, JSON schemas, and token economics.
7. [`10-DATA-QUALITY-AND-FRESHNESS.md`](./10-DATA-QUALITY-AND-FRESHNESS.md) — Root cause diagnosis of date bugs and canonical date hierarchy.
8. [`14-TECHNICAL-DECISIONS-AND-CHALLENGES.md`](./14-TECHNICAL-DECISIONS-AND-CHALLENGES.md) — Engineering decisions using the Problem → Reason → Trade-off framework.
9. [`17-INTERVIEW-PREPARATION.md`](./17-INTERVIEW-PREPARATION.md) — 20 realistic technical scenario questions and whiteboard walkthroughs.

### Pathway B: Assessment Evaluator / Quick Verification
1. [`20-PROJECT-STATUS-AND-DELIVERABLES.md`](./20-PROJECT-STATUS-AND-DELIVERABLES.md) — Verified status matrix for all assessment requirements.
2. [`16-TESTING-AND-VERIFICATION.md`](./16-TESTING-AND-VERIFICATION.md) — Verified test results (50/50 Python, 22/22 NestJS, Next.js build).
3. [`19-PROJECT-WALKTHROUGH.md`](./19-PROJECT-WALKTHROUGH.md) — Step-by-step live demonstration script.
4. [`09-API-REFERENCE.md`](./09-API-REFERENCE.md) — Live REST API endpoint reference and JSON payloads.

### Pathway C: Full-Stack Developer / Contributor
1. [`03-FOLDER-STRUCTURE.md`](./03-FOLDER-STRUCTURE.md) — File-by-file technical guide across root, ingestion, api, and web.
2. [`07-NESTJS-BACKEND.md`](./07-NESTJS-BACKEND.md) — NestJS controllers, services, DTO validation, and Prisma queries.
3. [`08-NEXTJS-FRONTEND.md`](./08-NEXTJS-FRONTEND.md) — App Router, React 19, Material UI, and state memoization.
4. [`11-SCHEDULING-AND-DEPLOYMENT.md`](./11-SCHEDULING-AND-DEPLOYMENT.md) — Local Docker setup, GitHub Actions daily cron, and migrations.
5. [`12-ERROR-HANDLING-AND-FAILURES.md`](./12-ERROR-HANDLING-AND-FAILURES.md) — Failure isolation, rate limits, and circuit breakers.
6. [`18-TECHNICAL-GLOSSARY.md`](./18-TECHNICAL-GLOSSARY.md) — Dual-level plain English and engineering glossary.

---

## 2. Master Table of Contents

| File | Document Title | Primary Focus & Core Subject Matter |
| :--- | :--- | :--- |
| [`00-PROJECT-OVERVIEW.md`](./00-PROJECT-OVERVIEW.md) | **Project Overview** | Problem statement, target users, market context, functional and non-functional requirements. |
| [`01-TECH-STACK.md`](./01-TECH-STACK.md) | **Technology Stack** | Complete technology matrix with exact versions, architectural justifications, and trade-offs. |
| [`02-SYSTEM-ARCHITECTURE.md`](./02-SYSTEM-ARCHITECTURE.md) | **System Architecture** | Mermaid architecture diagrams, inter-service communication protocols, and runtime setup. |
| [`03-FOLDER-STRUCTURE.md`](./03-FOLDER-STRUCTURE.md) | **Folder Structure Guide** | Actual repository tree with file-by-file explanations of classes, inputs, outputs, and failure impact. |
| [`04-DATABASE-DESIGN.md`](./04-DATABASE-DESIGN.md) | **Database Design & ERD** | PostgreSQL models, fields, Prisma schema, B-tree composite indexes, compound unique constraints, and ERD. |
| [`05-PYTHON-INGESTION-PIPELINE.md`](./05-PYTHON-INGESTION-PIPELINE.md) | **Python Ingestion Pipeline** | 10 collectors, data normalization, fresher scope check, India validation matrix, and upsert SQL. |
| [`06-LLM-CLASSIFICATION.md`](./06-LLM-CLASSIFICATION.md) | **LLM & AI Classification** | Gemini 2.5 Flash, system prompts, Pydantic JSON schema validation, circuit-breakers, and token economics. |
| [`07-NESTJS-BACKEND.md`](./07-NESTJS-BACKEND.md) | **NestJS Backend API** | Application bootstrap, Dependency Injection, QueryJobsDto, Prisma query construction, and Jest unit tests. |
| [`08-NEXTJS-FRONTEND.md`](./08-NEXTJS-FRONTEND.md) | **Next.js Frontend Client** | Next.js 16 App Router, React 19, Material UI, useJobs state memoization, and user discovery journey. |
| [`09-API-REFERENCE.md`](./09-API-REFERENCE.md) | **REST API Reference** | Complete endpoint reference with parameters, realistic JSON responses, status codes, and error formats. |
| [`10-DATA-QUALITY-AND-FRESHNESS.md`](./10-DATA-QUALITY-AND-FRESHNESS.md) | **Data Quality & Freshness** | Diagnosis of the date corruption bug, canonical six-tier date hierarchy, backfill script, and India matrix. |
| [`11-SCHEDULING-AND-DEPLOYMENT.md`](./11-SCHEDULING-AND-DEPLOYMENT.md) | **Scheduling & Deployment** | GitHub Actions daily ingestion cron (06:00 UTC), Docker containerization, and production deployment blueprint. |
| [`12-ERROR-HANDLING-AND-FAILURES.md`](./12-ERROR-HANDLING-AND-FAILURES.md) | **Error Handling & Failures** | Fault isolation across 10 failure scenarios, external 429 backoff, Gemini quota circuit-breaker, and retries. |
| [`13-SECURITY-AND-PERFORMANCE.md`](./13-SECURITY-AND-PERFORMANCE.md) | **Security & Performance** | SQL injection prevention, CORS, DTO whitelisting, URL safety, database indexing, and Turbopack builds. |
| [`14-TECHNICAL-DECISIONS-AND-CHALLENGES.md`](./14-TECHNICAL-DECISIONS-AND-CHALLENGES.md) | **Decisions & Challenges** | Core decisions analyzed using Problem → Reason → Trade-off, and real-world engineering bugs solved. |
| [`15-SCALABILITY-AND-FUTURE-ROADMAP.md`](./15-SCALABILITY-AND-FUTURE-ROADMAP.md) | **Scalability & Future Roadmap** | Growth tiers from 1,000 to 1,000,000+ jobs, Redis caching, read replicas, search engines, and target diagram. |
| [`16-TESTING-AND-VERIFICATION.md`](./16-TESTING-AND-VERIFICATION.md) | **Testing & Verification** | 50/50 Python tests, 22/22 NestJS unit tests, Next.js build verification, and live database telemetry. |
| [`17-INTERVIEW-PREPARATION.md`](./17-INTERVIEW-PREPARATION.md) | **Interview Preparation Guide** | 30s, 1m, 3m pitches, 5m whiteboard walkthrough, technology Q&A, and 20 realistic technical scenario questions. |
| [`18-TECHNICAL-GLOSSARY.md`](./18-TECHNICAL-GLOSSARY.md) | **Technical Glossary** | Dual-level plain English and formal engineering explanations for all project terms with codebase examples. |
| [`19-PROJECT-WALKTHROUGH.md`](./19-PROJECT-WALKTHROUGH.md) | **Live Demo Walkthrough** | Scripted chronological demonstration guide for evaluators with speaking prompts and screen actions. |
| [`20-PROJECT-STATUS-AND-DELIVERABLES.md`](./20-PROJECT-STATUS-AND-DELIVERABLES.md) | **Status & Deliverables Audit** | Standardized status audit against assessment requirements with live database telemetry and verification proofs. |
| [`INDEX.md`](./INDEX.md) | **Master Documentation Index** | This document: navigation hub, reading pathways, and directory structure. |
