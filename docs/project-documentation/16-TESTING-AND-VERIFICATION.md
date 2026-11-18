# Document 16: Testing, Quality Assurance & Verification Telemetry — Fresher Jobs India

## Executive Summary & Test Pass Matrix

Fresher Jobs India enforces automated testing across all layers: Python data engineering, NestJS business services, and Next.js production builds.

| Test Suite | Framework / Tool | Test File / Target | Tests Executed | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Python Ingestion & Processing** | Pytest 8.3.4 | `ingestion/tests/` (6 test files) | 50 | **50** | 0 | **100% PASS** |
| **NestJS API Service Queries** | Jest 29.7.0 | `apps/api/src/jobs/jobs.service.spec.ts` | 22 | **22** | 0 | **100% PASS** |
| **Next.js Production Build** | Turbopack / Next.js | `apps/web` (`next build`) | 5 Pages | **5** | 0 | **100% PASS** |
| **Live Database Integrity** | Node.js + Prisma | `apps/api/test_verified_dates.js` | 501 Jobs | **501** | 0 | **100% VERIFIED** |

---

## 1. Python Ingestion Test Suite (`ingestion/tests/`)

### Test Coverage Breakdown:
1. **`test_date_freshness.py`** (6 tests):
   - `test_freshness_fresh_within_7_days`: Validates `FRESH` status.
   - `test_freshness_recent_8_to_30_days`: Validates `RECENT` status.
   - `test_freshness_stale_over_30_days`: Validates `STALE` status.
   - `test_freshness_missing_or_none_date`: Validates `UNKNOWN` status.
   - `test_freshness_rejects_future_timestamp`: Rejects clock-skew or bad future dates.
   - `test_date_extraction_formats`: Verifies ISO 8601, epoch milliseconds, and Atom published date parsers.
2. **`test_india_eligibility.py`** (17 test cases):
   - Evaluates Tier-1 hubs (Bengaluru, Pune, Hyderabad, Mumbai, etc.).
   - Evaluates hybrid and India-remote roles.
   - Tests negative cases: Rejects `US only`, `London, UK`, `Canada Remote`.
   - Tests ambiguous cases: Quarantines `Worldwide Remote` without India confirmation.
   - Guardrails: Asserts that `Indiana` and `Indianapolis` are rejected as `INTERNATIONAL`.
3. **`test_processors.py`** (12 tests):
   - URL sanitization: strips `utm_source`, `ref`, and tracking queries.
   - Deterministic content hashing: verifies identical hash for identical input, different hash for modified titles.
   - HTML stripping: ensures `<p>`, `&amp;`, `<div>` tags are cleaned without corrupting text.
   - Eligibility filter: ensures "Fresher" and "Intern" pass; "Senior", "Lead", and "Principal" fail.
4. **`test_ai_classifier.py`** (3 tests):
   - Tests JSON parsing, code fence removal, and Pydantic schema validation.
   - Verifies graceful handling when Gemini API key is missing.
5. **`test_collectors.py`** (5 tests):
   - Verifies collector registry integrity.
   - Tests Greenhouse, Lever, and Jobicy payload parsers.
   - Confirms optional Naukri collector skips cleanly without throwing unhandled exceptions.
6. **`test_environment.py`** (7 tests):
   - Checks Python version, importability of `httpx`, `psycopg`, `pydantic`, and password masking in logs.

### Execution Command & Verified Result:
```bash
ingestion/venv/Scripts/pytest ingestion/tests/ -v
```
```text
============================= test session starts =============================
platform win32 -- Python 3.13.2, pytest-8.3.4, pluggy-1.7.0
rootdir: C:\Fresher Job Scrapper
collected 50 items

ingestion/tests/test_ai_classifier.py::test_usage_metadata_calculation PASSED
ingestion/tests/test_ai_classifier.py::test_classifier_gracefully_reports_unavailable_without_key PASSED
ingestion/tests/test_ai_classifier.py::test_classifier_parses_mocked_gemini_response PASSED
ingestion/tests/test_collectors.py::test_collector_registry_has_all_expected_sources PASSED
ingestion/tests/test_collectors.py::test_naukri_optional_collector_skips_cleanly_without_credentials PASSED
ingestion/tests/test_collectors.py::test_greenhouse_collector_parses_job_payload PASSED
ingestion/tests/test_collectors.py::test_lever_collector_parses_job_payload PASSED
ingestion/tests/test_collectors.py::test_jobicy_collector_parses_job_payload PASSED
ingestion/tests/test_date_freshness.py::test_freshness_fresh_within_7_days PASSED
ingestion/tests/test_date_freshness.py::test_freshness_recent_8_to_30_days PASSED
ingestion/tests/test_date_freshness.py::test_freshness_stale_over_30_days PASSED
ingestion/tests/test_date_freshness.py::test_freshness_missing_or_none_date PASSED
ingestion/tests/test_date_freshness.py::test_freshness_rejects_future_timestamp PASSED
ingestion/tests/test_date_freshness.py::test_date_extraction_formats PASSED
ingestion/tests/test_india_eligibility.py::test_specification_required_test_cases PASSED
...
============================= 50 passed in 6.40s ==============================
```

---

## 2. NestJS Backend Unit Test Suite (`jobs.service.spec.ts`)

The backend test suite validates all database query construction in `JobsService` using a Jest mock of `PrismaService` (runs independently without requiring a live database container).

### Test Coverage Highlights:
- **Default Invariants**: Asserts that `findAll()` automatically injects `{ status: 'ACTIVE' }` and `{ indiaEligibility: 'VERIFIED_INDIAN' }`.
- **Primary Sorting**: Asserts that `findAll()` sorts by `[{ postedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }]`.
- **Date Range Filter**: Asserts that default `dateRange = '30d'` injects `{ postedAt: { gte: Date, not: null } }`, while `dateRange = 'all'` omits the cutoff filter.
- **Faceted Filters**: Tests `search`, `city`, `role`, `jobType`, `experienceLevel`, `workMode`, and comma-separated `skills`.
- **Exception Handling**: Confirms that `findOne('job-id')` throws `NotFoundException` when a job is missing, marked `INTERNATIONAL`, or marked `AMBIGUOUS`.

### Execution Command & Verified Result:
```bash
pnpm --filter api test
```
```text
$ jest
PASS src/jobs/jobs.service.spec.ts (21.921 s)
  JobsService
    findAll
      √ returns paginated jobs with default params (36 ms)
      √ strictly enforces status=ACTIVE and indiaEligibility=VERIFIED_INDIAN (10 ms)
      √ applies search OR filter when search is provided (10 ms)
      √ applies city filter to location and classification.city (6 ms)
      √ applies role classification filter (6 ms)
      √ applies jobType filter (7 ms)
      √ applies experienceLevel filter (3 ms)
      √ applies workMode filter across job and classification (3 ms)
      √ applies skills filter splitting comma-separated string (6 ms)
      √ applies correct skip for page 3 limit 10 (5 ms)
      √ sorts by title ascending with postedAt tiebreaker (5 ms)
      √ sorts by company name with postedAt tiebreaker (7 ms)
      √ sorts strictly by postedAt descending by default or request (2 ms)
      √ applies default 30-day freshness filter excluding stale or null postedAt (3 ms)
      √ supports dateRange=all allowing older jobs without postedAt cutoff (2 ms)
      √ calculates hasNextPage=true when more pages exist (6 ms)
    findOne
      √ returns full job details when found and verified Indian (4 ms)
      √ throws NotFoundException when job does not exist (52 ms)
      √ throws NotFoundException when job is INTERNATIONAL (8 ms)
      √ throws NotFoundException when job is AMBIGUOUS (3 ms)
      √ queries by correct id (3 ms)
    getFilters
      √ returns distinct filters for verified Indian opportunities (7 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        23.653 s
```

---

## 3. Next.js Frontend Production Build Verification

Validates TypeScript type integrity, JSX syntax, and static page prerendering:

### Execution Command & Verified Result:
```bash
pnpm --filter web build
```
```text
$ next build
▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 221ms
  Creating an optimized production build ...
✓ Compiled successfully in 2.8s
  Running TypeScript ...
  Finished TypeScript in 14.7s ...
  Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (5/5) in 6.3s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
└ ƒ /jobs/[id]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 4. Live Database Verification Telemetry

A verification script hitting the live PostgreSQL database (`node apps/api/test_verified_dates.js`) reports the exact current data health:

```text
Total verified Indian active jobs: 501
{
  within24h: 40,
  within3d: 46,
  within7d: 68,
  within14d: 118,
  within30d: 201,
  olderThan30d: 300,
  nullDates: 0
}

Jobs where postedAt is identical/close to createdAt (likely assigned now()): 0
```

---

## 5. Identified Testing Gaps & Future QA Roadmap

| Gap | Risk | Recommended Solution |
| :--- | :--- | :--- |
| **End-to-End (E2E) Browser Tests** | Regressions during frontend UI updates | Introduce **Playwright** to automate user journeys (landing on homepage, typing "React", clicking card, opening application link). |
| **Visual Regression Testing** | Unintended CSS shifts across devices | Add Percy or Storybook test runner for `JobCard` and `JobResultsHeader`. |
| **External ATS Mock Server** | Tests dependent on external network access | Integrate `pytest-httpx` to mock Greenhouse and Lever JSON responses across offline CI environments. |
| **Load Testing** | Latency under concurrent search spikes | Execute **k6** or **Artillery** load tests simulating 250 concurrent users querying `/api/jobs`. |
