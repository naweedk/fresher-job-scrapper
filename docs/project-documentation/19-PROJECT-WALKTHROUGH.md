# Document 19: Step-by-Step Live Project Walkthrough & Demo Guide — Fresher Jobs India

## Executive Summary & Demonstration Objective

This guide provides a structured, chronological script to demonstrate **Fresher Jobs India** during a live technical evaluation, code walkthrough, or interview.

---

## 1. Pre-Demo Environment Verification Checklist

Before starting your demonstration, ensure the following steps are verified in terminal sessions:

```bash
# 1. Start the PostgreSQL Container (Port 5434)
pnpm db:up

# 2. Check Database Schema Status
pnpm --filter api exec prisma migrate status
# Expected Output: "Database schema is up to date!"

# 3. Verify Live Verified Jobs Count
node apps/api/test_verified_dates.js
# Expected Output: "Total verified Indian active jobs: 501"

# 4. Start the Application in Parallel
pnpm dev
# Starts Next.js on http://localhost:3000 and NestJS on http://localhost:3100
```

---

## 2. Chronological Demonstration Script

### Step 1: Landing on the Homepage (30 Seconds)
- **Action**: Open your browser to `http://localhost:3000`.
- **What to Say**:
  > *"This is Fresher Jobs India. It is a dedicated job discovery platform for early-career Indian engineering graduates. Notice the compact, clean design: there is no oversized marketing banner pushing job listings below the fold. The user immediately sees the search workspace and the active listings."*
- **What to Point Out on Screen**:
  - The green status badge in the header: **`Verified Indian Jobs`**.
  - The dynamic counter: **`Showing 1–20 of 501 verified jobs`**.
  - The job cards displaying company name, city (e.g. Bengaluru, Pune), work mode pill (On-site, Remote, Hybrid), and fresher experience badge.

---

### Step 2: Demonstrating Date Truth & Freshness (45 Seconds)
- **Action**: Point to the Date Range dropdown in `JobResultsHeader.tsx` and hover over the posting dates on the top cards.
- **What to Say**:
  > *"A critical problem with many job aggregators is data deception—scrapers set the posting date to 'today' whenever they run, so a job posted 9 months ago appears brand new. 
  > 
  > Here, our system enforces a canonical date hierarchy. Notice the top cards say 'Today' or 'Yesterday' because their authentic ATS publication timestamp from Greenhouse was in the last 24 hours. If we switch the date range dropdown to 'All Active Opportunities', we can see historical listings from months ago, but the default feed shows only genuine openings from the past 30 days."*
- **What to Show**:
  - Switch the Date Range dropdown to `Past 7 Days` → Notice the list instantly updates to show only jobs published in the past week.
  - Switch to `Newest First` sort → Explain that it sorts by `postedAt DESC` at the PostgreSQL database level, not client-side in JavaScript.

---

### Step 3: Demonstrating Faceted Search & Filtering (45 Seconds)
- **Action**: Type `React` in the search bar and select or type `Bengaluru` in the city filter. Click Search.
- **What to Say**:
  > *"Let's test searching for 'React' roles in 'Bengaluru'. When I submit this search, Next.js calls our NestJS backend at `/api/jobs` with validated query parameters. The backend queries PostgreSQL using B-tree indexed fields, performing a sub-20ms lookup across both the original location and AI-classified normalized cities."*
- **What to Point Out on Screen**:
  - The URL updates to reflect the active filters.
  - The job cards display extracted skill chips (e.g. `React`, `TypeScript`, `Node.js`).

---

### Step 4: Demonstrating the Job Detail Page & Direct Apply (45 Seconds)
- **Action**: Click on any job card (e.g. *Rubrik - Software Engineer* or *GE Healthcare*).
- **What to Say**:
  > *"When the candidate clicks a card, Next.js routes to `/jobs/[id]`. Let's look at the metadata transparency:
  > 1. In the header and overview sidebar, the original publication date is explicitly displayed. If the company updated the listing, `Source Last Updated` is displayed.
  > 2. The green badge confirms this is a direct, verified ingestion from Greenhouse.
  > 3. When the student clicks 'Apply on Company Site', it doesn't take them to an ad network or a recruitment agency form—it opens the official employer application portal in a new tab."*
- **What to Show**:
  - Click `Apply on Company Site` → Show that it opens the direct Greenhouse / Lever application form.

---

### Step 5: Demonstrating Mobile Responsiveness (30 Seconds)
- **Action**: Press `F12` to open Chrome DevTools and toggle device mode to **iPhone 14** or **Pixel 7**.
- **What to Say**:
  > *"In India, over 70% of freshers browse jobs on mobile devices. Notice how the desktop navigation smoothly transforms into a slide-out drawer, the search bar adapts vertically, the cards adjust to single-column layout, and a sticky bottom bar appears on the detail page so the applicant can apply with one tap."*

---

### Step 6: Showing the Backend & Database Architecture (60 Seconds)
- **Action**: Switch to VS Code and show `schema.prisma` and `ingestion/pipeline.py`.
- **What to Say**:
  > *"Let's quickly look under the hood at the engineering architecture.
  > 
  > In `schema.prisma`, we have our normalized models: `Company`, `Source`, `Job`, and `JobClassification`. Notice our composite indexes on `postedAt` and `indiaEligibility`, and our unique compound keys that prevent duplicate listings.
  > 
  > In `ingestion/pipeline.py`, we have our Python ETL engine. It handles rate limiting, rejects senior positions, evaluates Indian tech hubs, and runs an asynchronous batch worker with Gemini 2.5 Flash. If Gemini hits its daily rate limit, the pipeline doesn't crash—it yields gracefully and saves unclassified jobs with status 'PENDING'."*

---

### Step 7: Demonstrating Automated Test Verification (30 Seconds)
- **Action**: In the terminal, run the two test suites:
  ```bash
  # 1. Run NestJS Unit Tests
  pnpm --filter api test
  # 2. Run Python Ingestion Tests
  ingestion/venv/Scripts/pytest ingestion/tests/ -v
  ```
- **What to Say**:
  > *"Finally, we enforce 100% test verification. All 22 NestJS unit tests pass in under 22 seconds, and all 50 Python tests pass in 6.4 seconds, confirming date freshness, India geographic validation, and deduplication."*

---

## 3. Scripted Responses to Anticipated Interview Questions

| If the Interviewer Asks... | Deliver This Scripted Response: |
| :--- | :--- |
| *"Why did you use Python for scraping and NestJS for the API?"* | *"Separation of concerns. Python is the industry standard for HTML parsing, data transformation, and Pydantic validation. NestJS is built for high-concurrency, enterprise REST APIs with strict DTO validation and dependency injection. Decoupling them ensures a heavy scraping job never slows down client user searches."* |
| *"How do you know these jobs are actually in India?"* | *"Our `india_eligibility.py` module evaluates every listing against an explicit dictionary of Indian tech hubs (Bengaluru, Pune, Hyderabad, etc.), Indian states, and verified remote scopes. It specifically guards against false positives like Indianapolis or Indiana, and quarantines ambiguous remote listings."* |
| *"How do you handle Gemini API quota limits?"* | *"We implemented a circuit-breaker in `ai_classifier.py`. If Gemini returns a 429 quota error, the classifier logs a warning and exits cleanly without failing the pipeline. The jobs are already stored in PostgreSQL with status 'PENDING' and remain fully searchable."* |
