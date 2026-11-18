# Document 09: Complete REST API Reference — Fresher Jobs India

## Executive Summary & Base Configuration

The Fresher Jobs India REST API is exposed by the NestJS application (`apps/api`) at base path `/api`. All endpoints return standardized JSON payloads, honor CORS rules for configured frontends, and implement strict validation guards.

- **Base URL (Local)**: `http://localhost:3100/api`
- **Default Port**: `3100` (Configurable via `PORT` environment variable)
- **Content-Type**: `application/json`

---

## 1. API Endpoints Overview Matrix

| Method | Endpoint | Description | Primary Query / Body Parameters | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Paginated search, filtering, and listing of verified Indian jobs | `search`, `role`, `city`, `workMode`, `dateRange`, `page`, `limit`, `sortBy`, `sortOrder` | `200 OK` |
| `GET` | `/api/jobs/:id` | Detailed view of a single verified Indian opportunity | `id` (path parameter) | `200 OK` |
| `GET` | `/api/jobs/filters` | Distinct filter options (roles, cities, job types, work modes) | None | `200 OK` |
| `GET` | `/api/stats` | Aggregated platform metrics and job distribution breakdown | None | `200 OK` |
| `GET` | `/api/companies` | List all verified companies hiring in India | `search` | `200 OK` |
| `GET` | `/api/sources` | List all registered active data collection sources | None | `200 OK` |
| `GET` | `/api/health` | Liveness and database connectivity health probe | None | `200 OK` |
| `GET` | `/api` | Root server diagnostic ping | None | `200 OK` |

---

## 2. Detailed Endpoint Specifications

### 2.1 `GET /api/jobs` — Query & List Jobs

Returns a paginated list of active jobs located in India, sorted by authentic publication date.

#### Query Parameters:
| Parameter | Type | Default | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `search` | `string` | `undefined` | Any search text | Case-insensitive search across title, description, and company name |
| `city` | `string` | `undefined` | e.g. `Bengaluru`, `Pune`, `Mumbai` | Filter by Indian city name |
| `role` | `string` | `undefined` | e.g. `Frontend Developer` | Filter by AI-classified standardized role |
| `jobType` | `string` | `undefined` | `FULL_TIME`, `INTERNSHIP`, `CONTRACT` | Filter by employment type |
| `experienceLevel`| `string` | `undefined` | `FRESHER`, `ZERO_TO_ONE_YEAR`, `ONE_TO_TWO_YEARS` | Filter by required experience scope |
| `workMode` | `string` | `undefined` | `ONSITE`, `HYBRID`, `REMOTE` | Filter by work arrangement |
| `skills` | `string` | `undefined` | Comma-separated e.g. `React,Python` | Filter jobs requiring any of the listed skills |
| `dateRange` | `string` | `'30d'` | `'24h'`, `'3d'`, `'7d'`, `'14d'`, `'30d'`, `'all'` | Freshness cutoff window based on authentic `postedAt` |
| `page` | `integer`| `1` | `>= 1` | Pagination page number |
| `limit` | `integer`| `20` | `1 to 100` | Number of items per page |
| `sortBy` | `string` | `'postedAt'` | `'postedAt'`, `'title'`, `'company'`, `'createdAt'` | Primary sorting column |
| `sortOrder`| `string` | `'desc'` | `'asc'`, `'desc'` | Sort direction |

#### Example Request:
```http
GET /api/jobs?sortBy=postedAt&sortOrder=desc&dateRange=7d&city=Bengaluru&page=1&limit=2 HTTP/1.1
Host: localhost:3100
Accept: application/json
```

#### Example 200 OK Response:
```json
{
  "data": [
    {
      "id": "cm3kr81abc000108l9g71p49k",
      "title": "Software Engineer - Distributed Systems",
      "location": "Bengaluru",
      "workMode": "ONSITE",
      "indiaEligibility": "VERIFIED_INDIAN",
      "countryCode": "IN",
      "jobUrl": "https://boards.greenhouse.io/rubrik/jobs/5678901",
      "postedAt": "2026-11-17T00:01:13.000Z",
      "sourceUpdatedAt": "2026-11-17T00:01:13.000Z",
      "firstSeenAt": "2026-11-17T07:38:13.532Z",
      "lastSeenAt": "2026-11-17T15:37:19.796Z",
      "createdAt": "2026-11-17T07:38:13.532Z",
      "updatedAt": "2026-11-17T15:37:19.796Z",
      "status": "ACTIVE",
      "company": {
        "id": "co_rubrik_01",
        "name": "Rubrik",
        "logoUrl": null,
        "website": "https://www.rubrik.com"
      },
      "classification": {
        "role": "Software Engineer",
        "city": "Bengaluru",
        "jobType": "FULL_TIME",
        "experienceLevel": "FRESHER",
        "workMode": "ONSITE",
        "skills": ["C++", "Java", "Distributed Systems", "Linux"],
        "confidence": 0.94,
        "status": "COMPLETED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "total": 68,
    "totalPages": 34,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### 2.2 `GET /api/jobs/:id` — Retrieve Job Details

Fetches full job specifications including original HTML description, company profile, and audit dates.

#### Invariants Enforced:
- If the job ID exists but is tagged `INTERNATIONAL` or `AMBIGUOUS`, the endpoint throws `404 Not Found` to prevent leakage of unverified non-Indian listings.

#### Example Request:
```http
GET /api/jobs/cm3kr81abc000108l9g71p49k HTTP/1.1
Host: localhost:3100
```

#### Example 200 OK Response:
```json
{
  "id": "cm3kr81abc000108l9g71p49k",
  "externalId": "5678901",
  "title": "Software Engineer - Distributed Systems",
  "description": "Rubrik is seeking exceptional engineering graduates to build next-generation enterprise data security...",
  "location": "Bengaluru, Karnataka, India",
  "workMode": "ONSITE",
  "indiaEligibility": "VERIFIED_INDIAN",
  "countryCode": "IN",
  "jobUrl": "https://boards.greenhouse.io/rubrik/jobs/5678901",
  "canonicalUrl": "https://boards.greenhouse.io/rubrik/jobs/5678901",
  "postedAt": "2026-11-17T00:01:13.000Z",
  "sourceUpdatedAt": "2026-11-17T00:01:13.000Z",
  "firstSeenAt": "2026-11-17T07:38:13.532Z",
  "lastSeenAt": "2026-11-17T15:37:19.796Z",
  "expiresAt": null,
  "status": "ACTIVE",
  "companyId": "co_rubrik_01",
  "sourceId": "src_greenhouse_01",
  "company": {
    "id": "co_rubrik_01",
    "name": "Rubrik",
    "logoUrl": null,
    "website": "https://www.rubrik.com"
  },
  "source": {
    "id": "src_greenhouse_01",
    "name": "Greenhouse",
    "sourceType": "API",
    "baseUrl": "https://boards-api.greenhouse.io/v1/boards"
  },
  "classification": {
    "role": "Software Engineer",
    "city": "Bengaluru",
    "jobType": "FULL_TIME",
    "experienceLevel": "FRESHER",
    "workMode": "ONSITE",
    "skills": ["C++", "Java", "Distributed Systems", "Linux"],
    "confidence": 0.94,
    "status": "COMPLETED",
    "modelName": "gemini-2.5-flash",
    "promptVersion": "v1.0"
  }
}
```

#### Error Responses:
- `404 Not Found`:
  ```json
  {
    "statusCode": 404,
    "message": "Job with ID 'invalid-id' not found",
    "error": "Not Found"
  }
  ```

---

### 2.3 `GET /api/jobs/filters` — Faceted Filter Metadata

Dynamically returns unique filter options currently populated by active verified listings.

#### Example 200 OK Response:
```json
{
  "roles": [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Software Engineer",
    "Data Scientist",
    "UI/UX Designer",
    "QA Engineer",
    "Other"
  ],
  "cities": [
    "Bengaluru",
    "Hyderabad",
    "Pune",
    "Mumbai",
    "Gurugram",
    "Noida",
    "Chennai"
  ],
  "jobTypes": ["FULL_TIME", "INTERNSHIP", "CONTRACT"],
  "experienceLevels": ["FRESHER", "ZERO_TO_ONE_YEAR", "ONE_TO_TWO_YEARS"],
  "workModes": ["ONSITE", "HYBRID", "REMOTE"]
}
```

---

### 2.4 `GET /api/stats` — Platform Overview Statistics

Returns high-level aggregation metrics for dashboard cards and platform health monitoring.

#### Example 200 OK Response:
```json
{
  "totalJobs": 501,
  "activeJobs": 501,
  "expiredJobs": 0,
  "totalCompanies": 142,
  "activeSources": 8,
  "classifications": {
    "completed": 468,
    "pending": 33,
    "failed": 0
  },
  "byJobType": {
    "internships": 184,
    "fullTime": 317
  },
  "byWorkMode": {
    "remote": 62,
    "onsite": 321,
    "hybrid": 118
  },
  "lastUpdated": "2026-11-17T15:47:22.000Z"
}
```

---

### 2.5 `GET /api/health` — Liveness & Database Health

Monitors container and database connectivity.

#### Example 200 OK Response:
```json
{
  "status": "ok",
  "timestamp": "2026-11-17T17:08:00.000Z",
  "database": "connected"
}
```
