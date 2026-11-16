/**
 * Jobs service — wraps all /api/jobs endpoints.
 * Uses the base apiService from api.ts.
 */
import { apiService } from './api';
import type {
  JobsResponse,
  JobDetail,
  FiltersResponse,
  JobsQueryParams,
} from '../types/api.types';

function buildQueryString(params: JobsQueryParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q.set(k, String(v));
  });
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

export const jobsService = {
  getJobs(params: JobsQueryParams = {}): Promise<JobsResponse> {
    return apiService.get<JobsResponse>(`/jobs${buildQueryString(params)}`);
  },

  getJob(id: string): Promise<JobDetail> {
    return apiService.get<JobDetail>(`/jobs/${id}`);
  },

  getFilters(): Promise<FiltersResponse> {
    return apiService.get<FiltersResponse>('/jobs/filters');
  },
};
