'use client';
import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import JobSearchHeader from '../components/jobs/JobSearchHeader';
import JobResultsHeader from '../components/jobs/JobResultsHeader';
import JobList from '../components/jobs/JobList';
import JobPagination from '../components/jobs/JobPagination';
import { useJobs } from '../hooks/useJobs';
import type { JobsQueryParams } from '../types/api.types';

const DEFAULT_PARAMS: JobsQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'postedAt',
  sortOrder: 'desc',
  dateRange: '30d',
};

export default function HomePage() {
  const [params, setParams] = useState<JobsQueryParams>(DEFAULT_PARAMS);
  const { jobs, pagination, loading, error, refetch } = useJobs(params);

  const updateParams = useCallback((updates: Partial<JobsQueryParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSearchSubmit = useCallback((search: string, city: string) => {
    setParams((prev) => ({
      ...prev,
      search: search || undefined,
      city: city || undefined,
      page: 1,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    setParams((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange: string) => {
    setParams((prev) => ({
      ...prev,
      dateRange,
      page: 1,
    }));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* 1. Compact Navbar */}
      <Header />

      {/* 2. Compact Job Search Header */}
      <JobSearchHeader
        searchVal={params.search ?? ''}
        cityVal={params.city ?? ''}
        onSearch={handleSearchSubmit}
      />

      {/* 3. Main Discovery Workspace */}
      <Box component="main" sx={{ flex: 1, py: { xs: 2.5, md: 3.5 } }}>
        <Container maxWidth="xl">
          {/* Results Header (Count + Date Range + Sort) */}
          <JobResultsHeader
            pagination={pagination}
            loading={loading}
            sortBy={params.sortBy ?? 'postedAt'}
            sortOrder={params.sortOrder ?? 'desc'}
            dateRange={params.dateRange ?? '30d'}
            onSortChange={handleSortChange}
            onDateRangeChange={handleDateRangeChange}
          />

          {/* Job Cards Grid with Skeleton Loader */}
          <JobList
            jobs={jobs}
            loading={loading}
            error={error}
            onReset={handleReset}
            onRetry={refetch}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <JobPagination
              pagination={pagination}
              onChange={(newPage) => updateParams({ page: newPage })}
            />
          )}
        </Container>
      </Box>

      {/* 4. Compact Professional Footer */}
      <Footer />
    </Box>
  );
}
