/**
 * API-specific TypeScript types for Fresher Jobs India frontend.
 * These match the shapes returned by the NestJS backend endpoints.
 * Do NOT modify src/types/index.ts — this is the extended API types file.
 */

export interface JobListItem {
  id: string;
  title: string;
  location?: string;
  workMode?: string;
  countryCode?: string;
  indiaEligibility?: string;
  jobUrl: string;
  postedAt?: string;
  sourceUpdatedAt?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    website?: string;
  };
  classification?: {
    role?: string;
    city?: string;
    jobType?: string;
    experienceLevel?: string;
    workMode?: string;
    skills: string[];
    confidence?: number;
    status: string;
  };
}

export interface JobDetail extends JobListItem {
  description: string;
  externalId?: string;
  canonicalUrl?: string;
  expiresAt?: string;
  updatedAt: string;
  companyId: string;
  sourceId: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    website?: string;
  };
  source?: {
    id: string;
    name: string;
    sourceType: string;
    baseUrl?: string;
  };
  classification?: {
    role?: string;
    city?: string;
    jobType?: string;
    experienceLevel?: string;
    workMode?: string;
    skills: string[];
    confidence?: number;
    status: string;
    modelName?: string;
    promptVersion?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface JobsResponse {
  data: JobListItem[];
  pagination: PaginationMeta;
}

export interface StatsResponse {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  totalCompanies: number;
  activeSources: number;
  classifications: {
    completed: number;
    pending: number;
    failed: number;
  };
  byJobType: {
    internships: number;
    fullTime: number;
  };
  byWorkMode: {
    remote: number;
  };
  lastUpdated: string;
}

export interface FiltersResponse {
  roles: string[];
  cities: string[];
  jobTypes: string[];
  experienceLevels: string[];
  workModes: string[];
}

export interface JobsQueryParams {
  search?: string;
  role?: string;
  city?: string;
  jobType?: string;
  experienceLevel?: string;
  workMode?: string;
  skills?: string;
  dateRange?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}
