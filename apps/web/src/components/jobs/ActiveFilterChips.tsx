'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { JobsQueryParams } from '../../types/api.types';

interface Props {
  filters: JobsQueryParams;
  onRemove: (key: keyof JobsQueryParams) => void;
  onClearAll: () => void;
}

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher (0 yrs)',
  ZERO_TO_ONE_YEAR: '0–1 Year',
  ONE_TO_TWO_YEARS: '1–2 Years',
  OTHER: 'Entry-level',
};

export default function ActiveFilterChips({ filters, onRemove, onClearAll }: Props) {
  const activeItems: { key: keyof JobsQueryParams; label: string }[] = [];

  if (filters.search) {
    activeItems.push({ key: 'search', label: `Search: "${filters.search}"` });
  }
  if (filters.city) {
    activeItems.push({ key: 'city', label: `Location: ${filters.city}` });
  }
  if (filters.workMode) {
    activeItems.push({
      key: 'workMode',
      label: `Work Mode: ${WORK_MODE_LABELS[filters.workMode] ?? filters.workMode}`,
    });
  }
  if (filters.role) {
    activeItems.push({ key: 'role', label: `Role: ${filters.role}` });
  }
  if (filters.jobType) {
    activeItems.push({
      key: 'jobType',
      label: `Type: ${JOB_TYPE_LABELS[filters.jobType] ?? filters.jobType}`,
    });
  }
  if (filters.experienceLevel) {
    activeItems.push({
      key: 'experienceLevel',
      label: `Exp: ${EXP_LABELS[filters.experienceLevel] ?? filters.experienceLevel}`,
    });
  }
  if (filters.skills) {
    activeItems.push({ key: 'skills', label: `Skills: ${filters.skills}` });
  }

  if (activeItems.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        pt: 1.5,
        pb: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
        Active Filters:
      </Typography>

      {activeItems.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          size="small"
          onDelete={() => onRemove(item.key)}
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontWeight: 500,
            fontSize: '0.78rem',
            '& .MuiChip-deleteIcon': {
              color: '#64748b',
              fontSize: '15px',
              '&:hover': { color: '#0f172a' },
            },
          }}
        />
      ))}

      <Button
        size="small"
        onClick={onClearAll}
        sx={{
          py: 0.2,
          px: 1,
          minHeight: 'auto',
          fontSize: '0.75rem',
          color: 'primary.main',
          fontWeight: 600,
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
        }}
      >
        Clear all
      </Button>
    </Box>
  );
}
