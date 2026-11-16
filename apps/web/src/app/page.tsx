'use client';
import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PlatformStats from '../components/stats/PlatformStats';
import JobSearch from '../components/jobs/JobSearch';
import JobFilters from '../components/jobs/JobFilters';
import JobList from '../components/jobs/JobList';
import JobSort from '../components/jobs/JobSort';
import JobPagination from '../components/jobs/JobPagination';
import { useJobs } from '../hooks/useJobs';
import { useJobFilters } from '../hooks/useJobFilters';
import type { JobsQueryParams } from '../types/api.types';

const DEFAULT_PARAMS: JobsQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export default function HomePage() {
  const [params, setParams] = useState<JobsQueryParams>(DEFAULT_PARAMS);
  const { jobs, pagination, loading, error, refetch } = useJobs(params);
  const { filters } = useJobFilters();

  const updateParams = useCallback((updates: Partial<JobsQueryParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e8eaed',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ maxWidth: 720 }}>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '1.85rem', sm: '2.4rem', md: '2.8rem' },
                lineHeight: 1.15,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              Find Your Next Opportunity.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, mb: 3, fontSize: { xs: '1rem', md: '1.2rem' } }}
            >
              Discover internships and entry-level jobs from companies across India.
            </Typography>

            <Box sx={{ maxWidth: 580 }}>
              <JobSearch
                value={params.search ?? ''}
                onChange={(searchVal) => updateParams({ search: searchVal || undefined, page: 1 })}
                placeholder="Search job title, company or skills (e.g. React, Python)..."
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Live Platform Stats */}
      <Box component="section" sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed', py: 3 }}>
        <Container maxWidth="xl">
          <PlatformStats />
        </Container>
      </Box>

      {/* Main Job Discovery Section */}
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 3.5, alignItems: 'flex-start' }}>
            {/* Desktop Filters Sidebar */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: 250, flexShrink: 0 }}>
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#ffffff' }}>
                <JobFilters
                  filters={filters}
                  activeFilters={params}
                  onChange={updateParams}
                  onReset={handleReset}
                />
              </Paper>
            </Box>

            {/* Results Content Area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Toolbar: Result count + Mobile filters button + Sorting */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: { md: 'none' } }}>
                    <JobFilters
                      filters={filters}
                      activeFilters={params}
                      onChange={updateParams}
                      onReset={handleReset}
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {loading
                      ? 'Searching jobs...'
                      : pagination
                      ? `${pagination.total.toLocaleString('en-IN')} verified opportunities`
                      : ''}
                  </Typography>
                </Box>

                <JobSort
                  sortBy={params.sortBy ?? 'createdAt'}
                  sortOrder={params.sortOrder ?? 'DESC'}
                  onChange={(newSortBy, newSortOrder) =>
                    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 })
                  }
                />
              </Box>

              {/* Jobs List Grid / Loading / Error / Empty States */}
              <JobList
                jobs={jobs}
                loading={loading}
                error={error}
                onReset={handleReset}
                onRetry={refetch}
              />

              {/* Server-Side Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <JobPagination
                  pagination={pagination}
                  onChange={(newPage) => {
                    updateParams({ page: newPage });
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                />
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
