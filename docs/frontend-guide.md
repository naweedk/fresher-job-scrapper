# Frontend Guide — Fresher Jobs India

## Architecture Overview

The frontend is a Next.js 16 App Router application using React 19, TypeScript strict mode and Material UI 9.

```
apps/web/src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout with ThemeRegistry
│   ├── page.tsx              # Homepage / Job Discovery
│   ├── not-found.tsx         # 404 page
│   ├── about/page.tsx        # About page
│   └── jobs/[id]/page.tsx    # Job Detail page
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Sticky top nav with mobile drawer
│   │   └── Footer.tsx        # Footer with project info
│   ├── jobs/
│   │   ├── JobCard.tsx       # Individual job card (list view)
│   │   ├── JobList.tsx       # Grid of job cards with states
│   │   ├── JobFilters.tsx    # Filter sidebar + mobile drawer
│   │   ├── JobSearch.tsx     # Debounced search input (400ms)
│   │   ├── JobSort.tsx       # Sort dropdown
│   │   └── JobPagination.tsx # MUI Pagination + result count
│   ├── stats/
│   │   └── PlatformStats.tsx # 4-stat platform summary cards
│   └── common/
│       ├── LoadingState.tsx   # Spinner + message
│       ├── EmptyState.tsx     # Empty results with reset action
│       └── ErrorState.tsx     # Error alert with retry
│
├── hooks/
│   ├── useJobs.ts            # Job listing fetch + state management
│   └── useJobFilters.ts      # Filter metadata fetch
│
├── services/
│   ├── api.ts                # Base fetch wrapper + ApiError
│   ├── jobs.service.ts       # Jobs API calls (list, detail, filters)
│   └── stats.service.ts      # Stats API calls
│
├── theme/
│   ├── theme.ts              # MUI theme configuration
│   └── ThemeRegistry.tsx     # Client-side ThemeProvider wrapper
│
└── types/
    ├── index.ts              # Existing type exports (preserved)
    └── api.types.ts          # API response shapes (Phase 3)
```

---

## Component Responsibilities

### Pages

| Page | Route | Responsibility |
|------|-------|----------------|
| `page.tsx` | `/` | Homepage with hero, stats, search, filters, job list, pagination |
| `jobs/[id]/page.tsx` | `/jobs/:id` | Full job detail with apply link |
| `about/page.tsx` | `/about` | Project description |
| `not-found.tsx` | `*` (404) | 404 fallback |

### Key Design Decisions

1. **URL-param-less state** — search/filter state lives in React state (`useState`) in the homepage. For production, this could be moved to URL query params for shareability, but React state is simpler for this assessment.

2. **Debounced search** — `JobSearch.tsx` debounces the `onChange` callback by 400ms so the API is not called on every keystroke.

3. **Pending classification handling** — `JobCard.tsx` checks `classification?.status === 'COMPLETED'` before displaying classified data. For unclassified jobs, it falls back to raw `job.location` and shows "Classification pending" caption.

4. **MUI Grid v9** — Uses `size` prop API (`<Grid size={{ xs: 12, md: 6 }}>`). The old `item`/`container`/`xs` props are not used.

5. **`'use client'`** — All interactive components use the directive. Layout and about page are Server Components (no directive).

---

## API Integration

All API communication goes through `src/services/api.ts`:

```typescript
// Base wrapper
apiService.get<T>(path: string): Promise<T>
// Throws ApiError(statusCode, message) on non-2xx responses
```

Service modules:
```typescript
// Job listing and detail
jobsService.getJobs(params: JobsQueryParams): Promise<JobsResponse>
jobsService.getJob(id: string): Promise<JobDetail>
jobsService.getFilters(): Promise<FiltersResponse>

// Platform statistics
statsService.getStats(): Promise<StatsResponse>
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | NestJS API base URL including `/api` suffix |

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3100/api
```

> [!IMPORTANT]
> `NEXT_PUBLIC_` prefix is required for Next.js to expose variables to the browser. Never put secrets or private keys with this prefix.

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL running (via Docker) on port 5434
- NestJS API running on port 3100

### Start the frontend

```bash
# From monorepo root
pnpm dev:web

# Or directly
cd apps/web
pnpm dev
```

The development server starts at `http://localhost:3000`.

### Start both frontend and API together

```bash
# From monorepo root
pnpm dev
```

---

## Loading, Empty and Error States

Each page and list component handles three states:

| State | Component | Trigger |
|-------|-----------|---------|
| Loading | `LoadingState.tsx` | While API request is in-flight |
| Empty | `EmptyState.tsx` | API returns 0 results |
| Error | `ErrorState.tsx` | Network error or API error |

The job detail page additionally handles:
- **404** (job not found) — dedicated "Job not found" UI with Back button
- **Loading skeleton** — `Skeleton` components while fetching

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| xs | 0–600px | Single column, mobile filter drawer |
| sm | 600–900px | 2-column job grid |
| md | 900–1200px | Sidebar filters + job grid |
| lg | 1200px+ | Wider job grid (3 columns) |

Filter sidebar (`JobFilters.tsx`):
- **Desktop (≥md)**: Always-visible sidebar in a `Paper` card
- **Mobile (<md)**: "Filters" button opens a bottom `Drawer`

---

## MUI Version Notes (v9 specific)

- `Grid` from `@mui/material` is Grid2 in MUI v9. Use `size` prop: `<Grid size={{ xs: 12, md: 6 }}>`
- `Chip` icon prop requires explicit `fontSize` on SVG icons
- `AppBar color="inherit"` with explicit `bgcolor` avoids default color issues
- `ThemeProvider` must be in a `'use client'` component (cannot be in Server Components)
