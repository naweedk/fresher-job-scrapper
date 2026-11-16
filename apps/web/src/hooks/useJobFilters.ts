'use client';
/**
 * useJobFilters — fetches the available filter options from /api/jobs/filters.
 */
import { useState, useEffect } from 'react';
import { jobsService } from '../services/jobs.service';
import type { FiltersResponse } from '../types/api.types';

const EMPTY_FILTERS: FiltersResponse = {
  roles: [],
  cities: [],
  jobTypes: [],
  experienceLevels: [],
  workModes: [],
};

export function useJobFilters() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsService
      .getFilters()
      .then((f) => setFilters(f))
      .catch(() => setFilters(EMPTY_FILTERS))
      .finally(() => setLoading(false));
  }, []);

  return { filters, loading };
}
