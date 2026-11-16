'use client';
/**
 * useJobs — fetches a paginated list of jobs from the API.
 * Re-fetches whenever params change (deep-compared via JSON.stringify).
 */
import { useState, useEffect, useCallback } from 'react';
import { jobsService } from '../services/jobs.service';
import type { JobListItem, PaginationMeta, JobsQueryParams } from '../types/api.types';

interface UseJobsState {
  jobs: JobListItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

export function useJobs(params: JobsQueryParams) {
  const [state, setState] = useState<UseJobsState>({
    jobs: [],
    pagination: null,
    loading: true,
    error: null,
  });

  // Fetch implementation
  const fetchJobs = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await jobsService.getJobs(params);
      setState({
        jobs: res.data,
        pagination: res.pagination,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load jobs',
      }));
    }
    // JSON.stringify is intentional — deep-compare params object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return { ...state, refetch: fetchJobs };
}
