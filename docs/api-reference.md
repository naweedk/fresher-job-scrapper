# API Reference — Fresher Jobs India

Base URL: `http://localhost:3100/api`

---

## Jobs

### GET /api/jobs

Returns a paginated list of active job listings with optional search and filters.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Full-text search across title, description, company name |
| `role` | string | — | Filter by classified role (partial, case-insensitive) |
| `city` | string | — | Filter by classified city (partial, case-insensitive) |
| `jobType` | enum | — | `INTERNSHIP`, `FULL_TIME`, `CONTRACT`, `OTHER` |
| `experienceLevel` | enum | — | `FRESHER`, `ZERO_TO_ONE_YEAR`, `ONE_TO_TWO_YEARS`, `OTHER` |
| `workMode` | enum | — | `ONSITE`, `REMOTE`, `HYBRID`, `UNKNOWN` |
| `skills` | string | — | Comma-separated skills (e.g. `React,Node.js`) |
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 20 | Results per page (min: 1, max: 100) |
| `sortBy` | enum | `createdAt` | `postedAt`, `createdAt`, `title`, `company` |
| `sortOrder` | enum | `DESC` | `ASC`, `DESC` |

#### Example Request

```
GET /api/jobs?search=react&city=Mumbai&jobType=INTERNSHIP&page=1&limit=20
```

#### Example Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Frontend Developer Intern",
      "location": "Mumbai",
      "jobUrl": "https://example.com/jobs/123",
      "postedAt": "2026-11-15T00:00:00.000Z",
      "createdAt": "2026-11-16T10:00:00.000Z",
      "status": "ACTIVE",
      "company": {
        "id": "company-uuid",
        "name": "Example Company",
        "logoUrl": null,
        "website": "https://example.com"
      },
      "classification": {
        "role": "Frontend Developer",
        "city": "Mumbai",
        "jobType": "INTERNSHIP",
        "experienceLevel": "FRESHER",
        "workMode": "HYBRID",
        "skills": ["React", "JavaScript", "CSS"],
        "confidence": 0.94,
        "status": "COMPLETED"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

> [!NOTE]
> Jobs without a completed classification (`status: "PENDING"`) are still returned. Their `classification` object will have `status: "PENDING"` and null/empty values for role, city, etc. Classification-based filters (`role`, `city`, `jobType`, `experienceLevel`, `workMode`, `skills`) only match jobs that have a `COMPLETED` classification.

---

### GET /api/jobs/filters

Returns distinct filter values available from completed AI classifications. Use this to populate filter dropdowns in the UI.

#### Example Response

```json
{
  "roles": ["Backend Developer", "Data Analyst", "Frontend Developer", "Full Stack Developer", "Software Engineer"],
  "cities": ["Bengaluru", "Chennai", "Hyderabad", "Mumbai", "Pune"],
  "jobTypes": ["FULL_TIME", "INTERNSHIP"],
  "experienceLevels": ["FRESHER", "ZERO_TO_ONE_YEAR"],
  "workModes": ["HYBRID", "ONSITE", "REMOTE"]
}
```

> [!NOTE]
> This endpoint only returns values derived from jobs with `ClassificationStatus = COMPLETED`. If no jobs have been classified yet, arrays will be empty. This is accurate — not a limitation.

---

### GET /api/jobs/:id

Returns the full details of a single job listing.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Job identifier |

#### Example Request

```
GET /api/jobs/550e8400-e29b-41d4-a716-446655440000
```

#### Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Frontend Developer Intern",
  "description": "We are looking for a passionate frontend developer intern...",
  "location": "Mumbai",
  "jobUrl": "https://example.com/jobs/123",
  "canonicalUrl": "https://example.com/jobs/123",
  "postedAt": "2026-11-15T00:00:00.000Z",
  "expiresAt": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-16T10:00:00.000Z",
  "updatedAt": "2026-11-16T10:00:00.000Z",
  "company": {
    "id": "company-uuid",
    "name": "Example Company",
    "logoUrl": null,
    "website": "https://example.com"
  },
  "source": {
    "id": "source-uuid",
    "name": "Simplify Jobs",
    "sourceType": "API",
    "baseUrl": "https://api.simplify.jobs"
  },
  "classification": {
    "role": "Frontend Developer",
    "city": "Mumbai",
    "jobType": "INTERNSHIP",
    "experienceLevel": "FRESHER",
    "workMode": "HYBRID",
    "skills": ["React", "JavaScript", "CSS"],
    "confidence": 0.94,
    "status": "COMPLETED",
    "modelName": "gemini-2.5-flash",
    "promptVersion": "job-classification-v1"
  }
}
```

#### Error Responses

| Status | Condition |
|--------|-----------|
| 404 | Job not found |

---

## Statistics

### GET /api/stats

Returns live platform statistics aggregated from the database.

#### Example Response

```json
{
  "totalJobs": 8763,
  "activeJobs": 8763,
  "expiredJobs": 0,
  "totalCompanies": 2315,
  "activeSources": 5,
  "classifications": {
    "completed": 3,
    "pending": 8760,
    "failed": 0
  },
  "byJobType": {
    "internships": 1,
    "fullTime": 2
  },
  "byWorkMode": {
    "remote": 1
  },
  "lastUpdated": "2026-11-16T10:00:00.000Z"
}
```

---

## Health

### GET /api/health

Returns API and database health status.

```json
{ "status": "ok", "service": "fresher-jobs-api", "database": "connected" }
```

Returns HTTP 503 when the database is unreachable.

---

## Error Format

All error responses follow NestJS standard format:

```json
{
  "statusCode": 404,
  "message": "Job not found",
  "error": "Not Found"
}
```

---

## Rate Limiting

No rate limiting is currently implemented. The API is intended for internal frontend use only. CORS is restricted to `FRONTEND_URL` from environment configuration.
