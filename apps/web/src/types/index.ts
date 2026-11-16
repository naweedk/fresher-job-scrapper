/**
 * Shared TypeScript types for Fresher Jobs India frontend.
 * These mirror the API response shapes from the NestJS backend.
 */

export type JobStatus = 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
export type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT' | 'OTHER';
export type ExperienceLevel =
  | 'FRESHER'
  | 'ZERO_TO_ONE_YEAR'
  | 'ONE_TO_TWO_YEARS'
  | 'OTHER';
export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID' | 'UNKNOWN';
export type ClassificationStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEW_REQUIRED';

export interface Company {
  id: string;
  name: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobClassification {
  id: string;
  jobId: string;
  role?: string;
  city?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  workMode?: WorkMode;
  skills: string[];
  confidence?: number;
  modelName?: string;
  promptVersion?: string;
  status: ClassificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  sourceId: string;
  externalId?: string;
  title: string;
  description: string;
  location?: string;
  jobUrl: string;
  canonicalUrl?: string;
  postedAt?: string;
  expiresAt?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  classification?: JobClassification;
}

export interface ApiHealthResponse {
  status: 'ok' | 'error';
  service: string;
  database: 'connected' | 'disconnected';
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  environment: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
