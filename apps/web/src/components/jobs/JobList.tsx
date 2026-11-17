'use client';
import React from 'react';
import Grid from '@mui/material/Grid';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import type { JobListItem } from '../../types/api.types';

interface JobListProps {
  jobs: JobListItem[];
  loading: boolean;
  error: string | null;
  onReset?: () => void;
  onRetry?: () => void;
}

export default function JobList({ jobs, loading, error, onReset, onRetry }: JobListProps) {
  if (loading) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
            <JobCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No matching jobs found"
        message="Try adjusting your search criteria, clearing some filters, or checking back later."
        onReset={onReset}
      />
    );
  }

  return (
    <Grid container spacing={2.5}>
      {jobs.map((job) => (
        <Grid key={job.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <JobCard job={job} />
        </Grid>
      ))}
    </Grid>
  );
}
