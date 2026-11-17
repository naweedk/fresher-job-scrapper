'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { FiltersResponse, JobsQueryParams } from '../../types/api.types';
import JobFilterDrawer from './JobFilterDrawer';

interface Props {
  filters: FiltersResponse | null;
  activeFilters: JobsQueryParams;
  onChange: (updates: Partial<JobsQueryParams>) => void;
  onReset: () => void;
}

const WORK_MODE_OPTIONS = [
  { value: '', label: 'All Work Modes' },
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
];

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'All Job Types' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'CONTRACT', label: 'Contract' },
];

const EXP_OPTIONS = [
  { value: '', label: 'All Experience' },
  { value: 'FRESHER', label: 'Fresher (0 yrs)' },
  { value: 'ZERO_TO_ONE_YEAR', label: '0–1 Year' },
  { value: 'ONE_TO_TWO_YEARS', label: '1–2 Years' },
  { value: 'OTHER', label: 'Entry Level' },
];

export default function JobFilterToolbar({
  filters,
  activeFilters,
  onChange,
  onReset,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Count active filters
  const activeCount = [
    activeFilters.workMode,
    activeFilters.role,
    activeFilters.jobType,
    activeFilters.experienceLevel,
    activeFilters.city,
  ].filter(Boolean).length;

  const handleSelect = (field: keyof JobsQueryParams, value: string) => {
    onChange({ [field]: value || undefined, page: 1 });
  };

  const selectStyle = {
    height: 38,
    bgcolor: '#ffffff',
    fontSize: '0.84rem',
    fontWeight: 500,
    color: '#334155',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#cbd5e1',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: 1.5,
    },
    '& .MuiSelect-select': {
      py: 1,
      px: 1.5,
      pr: '32px !important',
      display: 'flex',
      alignItems: 'center',
    },
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        p: { xs: 1.5, md: 1.5 },
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Desktop Filter Row */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          alignItems: 'center',
          gap: 1.25,
          flexWrap: 'wrap',
        }}
      >
        {/* 1. Work Mode */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={activeFilters.workMode ?? ''}
            onChange={(e) => handleSelect('workMode', e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              ...selectStyle,
              ...(activeFilters.workMode ? { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 } : {}),
            }}
          >
            {WORK_MODE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 2. Job Category / Role */}
        <FormControl size="small" sx={{ minWidth: 155 }}>
          <Select
            value={activeFilters.role ?? ''}
            onChange={(e) => handleSelect('role', e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              ...selectStyle,
              ...(activeFilters.role ? { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 } : {}),
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Categories</MenuItem>
            {(filters?.roles ?? []).map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. Experience Level */}
        <FormControl size="small" sx={{ minWidth: 145 }}>
          <Select
            value={activeFilters.experienceLevel ?? ''}
            onChange={(e) => handleSelect('experienceLevel', e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              ...selectStyle,
              ...(activeFilters.experienceLevel ? { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 } : {}),
            }}
          >
            {EXP_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 4. Employment Type */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={activeFilters.jobType ?? ''}
            onChange={(e) => handleSelect('jobType', e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              ...selectStyle,
              ...(activeFilters.jobType ? { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 } : {}),
            }}
          >
            {JOB_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 5. Location / City */}
        <FormControl size="small" sx={{ minWidth: 145 }}>
          <Select
            value={activeFilters.city ?? ''}
            onChange={(e) => handleSelect('city', e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              ...selectStyle,
              ...(activeFilters.city ? { borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 } : {}),
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Locations</MenuItem>
            {(filters?.cities ?? []).slice(0, 40).map((c) => (
              <MenuItem key={c} value={c} sx={{ fontSize: '0.85rem' }}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset Action Button */}
        {activeCount > 0 && (
          <Button
            size="small"
            startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
            onClick={onReset}
            sx={{
              ml: 'auto',
              color: 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: 500,
              py: 0.8,
              '&:hover': { color: 'error.main', bgcolor: '#fef2f2' },
            }}
          >
            Reset Filters
          </Button>
        )}
      </Box>

      {/* Mobile / Tablet Filter Button */}
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={
            <Badge badgeContent={activeCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', height: 16, minWidth: 16 } }}>
              <TuneIcon sx={{ fontSize: 18 }} />
            </Badge>
          }
          onClick={() => setDrawerOpen(true)}
          sx={{
            py: 0.9,
            color: activeCount > 0 ? 'primary.main' : 'text.primary',
            borderColor: activeCount > 0 ? 'primary.main' : '#cbd5e1',
            fontWeight: 600,
            fontSize: '0.88rem',
            bgcolor: activeCount > 0 ? 'primary.light' : '#ffffff',
          }}
        >
          {activeCount > 0 ? `Filters Applied (${activeCount})` : 'Filter Job Listings'}
        </Button>

        {activeCount > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={onReset}
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              fontSize: '0.82rem',
              '&:hover': { color: 'error.main' },
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Responsive Drawer Component */}
      <JobFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        activeFilters={activeFilters}
        onChange={onChange}
        onReset={onReset}
      />
    </Box>
  );
}
