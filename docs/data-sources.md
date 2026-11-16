# Data Sources Registry — Fresher Jobs India

This document details all verified, legitimate public sources integrated into the data collection pipeline in Phase 2.

---

## 1. Integrated Sources Summary

| Source Name | Type | Access Method | Freshers Target | Verification Date |
|---|---|---|---|---|
| **SimplifyJobs** | API / Open Registry | Public JSON Endpoints | Recent Graduates & Summer 2025 Interns | Nov 2026 |
| **Arbeitnow** | API | Documented Public REST API | Entry-Level, Juniors & Tech Roles | Nov 2026 |
| **RemoteOK** | API | Public REST Endpoint | Junior / Remote Positions | Nov 2026 |
| **Hasjob** | RSS / Atom | Public Atom Feed | Indian Tech Startups & Developers | Nov 2026 |
| **Remotive** | API | Public Remote API | Worldwide & Entry Tech Listings | Nov 2026 |

---

## 2. Detailed Source Profiles

### 1. SimplifyJobs (New Grad & Summer 2025 Internships)
- **Official Repository**: [https://github.com/SimplifyJobs/New-Grad-Positions](https://github.com/SimplifyJobs/New-Grad-Positions)
- **Collection Method**: Raw JSON endpoints (`listings.json`) directly tracking official applicant tracking systems (Greenhouse, Lever, Workday, Ashby, Taleo).
- **Permissions & Usage**: Open public dataset specifically curated for entry-level college graduates and interns.
- **Data Fields Collected**: `title`, `company_name`, `url`, `locations`, `category`, `degrees`, `date_posted`.
- **Known Limitations**: Locations can be multi-national; filtered in pipeline for India, Remote, or global accessibility.

### 2. Arbeitnow
- **Official URL**: [https://www.arbeitnow.com/api/job-board-api](https://www.arbeitnow.com/api/job-board-api)
- **Collection Method**: Documented REST API with page-based pagination.
- **Permissions & Usage**: Free public API explicitly provided for job boards and aggregators with attribution.
- **Rate Limits**: 1 request/second recommended.
- **Data Fields Collected**: `slug`, `company_name`, `title`, `description`, `location`, `remote`, `url`, `tags`, `job_types`.
- **Filtering Applied**: Filtered through the fresher eligibility engine for junior, entry-level, and trainee keywords.

### 3. RemoteOK
- **Official URL**: [https://remoteok.com/api](https://remoteok.com/api)
- **Collection Method**: HTTP GET returning structured JSON array of remote opportunities.
- **Permissions & Usage**: Public API with User-Agent identification.
- **Data Fields Collected**: `id`, `position`, `company`, `description`, `apply_url`, `tags`, `location`, `epoch`.
- **Filtering Applied**: Only listings matching entry-level / junior patterns or worldwide remote reach are admitted.

### 4. Hasjob (Hasgeek)
- **Official URL**: [https://hasjob.co/feed](https://hasjob.co/feed)
- **Collection Method**: XML/Atom feed.
- **Permissions & Usage**: Public syndication feed published for job discoverability across Indian startups.
- **Data Fields Collected**: `title`, `link`, `summary`, `published`, `id`.
- **Focus**: Indian startups, early-stage product companies, developer internships.

### 5. Remotive
- **Official URL**: [https://remotive.com/api/remote-jobs](https://remotive.com/api/remote-jobs)
- **Collection Method**: HTTP REST API.
- **Permissions & Usage**: Publicly accessible API for remote work opportunities.
- **Data Fields Collected**: `id`, `url`, `title`, `company_name`, `candidate_required_location`, `description`, `publication_date`.
