'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Link from 'next/link';
import type { JobListItem } from '../../types/api.types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  UNKNOWN: 'Unknown',
};

function formatJobType(t?: string): string | null {
  return t ? (JOB_TYPE_LABELS[t] ?? t) : null;
}

function formatWorkMode(m?: string): string | null {
  return m ? (WORK_MODE_LABELS[m] ?? m) : null;
}

interface Props {
  job: JobListItem;
}

export default function JobCard({ job }: Props) {
  const { classification } = job;
  const location = classification?.city ?? job.location;
  const jobType = formatJobType(classification?.jobType);
  const workMode = formatWorkMode(job.workMode || classification?.workMode);
  const skills = classification?.skills ?? [];
  const isClassified = classification?.status === 'COMPLETED';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
          transition: 'all 0.18s ease-in-out',
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Title + job type chip */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.35 }}
          >
            {job.title}
          </Typography>
          {jobType && (
            <Chip
              label={jobType}
              size="small"
              color={
                classification?.jobType === 'INTERNSHIP'
                  ? 'secondary'
                  : 'primary'
              }
              variant="outlined"
              sx={{ flexShrink: 0, fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Company */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {job.company.name}
          </Typography>
        </Box>

        {/* Location + work mode */}
        {location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
            {workMode && (
              <Chip
                label={workMode}
                size="small"
                variant="outlined"
                sx={{ ml: 0.5, height: 20, fontSize: '0.68rem' }}
              />
            )}
          </Box>
        )}

        {/* Role chip */}
        {isClassified && classification?.role && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={classification.role}
              size="small"
              sx={{
                bgcolor: '#e8f0fe',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            />
          </Box>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {skills.slice(0, 3).map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.68rem' }}
              />
            ))}
            {skills.length > 3 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ alignSelf: 'center', ml: 0.5 }}
              >
                +{skills.length - 3} more
              </Typography>
            )}
          </Box>
        )}

        {!isClassified && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ mt: 1, display: 'block' }}
          >
            Classification pending
          </Typography>
        )}
      </CardContent>

      <CardActions
        sx={{
          px: 2.5,
          pb: 2,
          pt: 0,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {(job.postedAt ?? job.createdAt) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {formatDate(job.postedAt ?? job.createdAt)}
            </Typography>
          </Box>
        )}
        <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', marginLeft: 'auto' }}>
          <Button
            size="small"
            variant="contained"
            disableElevation
            sx={{ fontWeight: 600 }}
          >
            View Details
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}
