'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import type { FiltersResponse, JobsQueryParams } from '../../types/api.types';

interface Props {
  open: boolean;
  onClose: () => void;
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

export default function JobFilterDrawer({
  open,
  onClose,
  filters,
  activeFilters,
  onChange,
  onReset,
}: Props) {
  const [prevActiveFilters, setPrevActiveFilters] = useState(activeFilters);
  const [draftFilters, setDraftFilters] = useState<JobsQueryParams>(activeFilters);

  if (activeFilters !== prevActiveFilters) {
    setPrevActiveFilters(activeFilters);
    setDraftFilters(activeFilters);
  }

  const handleDraftChange = (field: keyof JobsQueryParams, value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApply = () => {
    onChange({
      workMode: draftFilters.workMode,
      role: draftFilters.role,
      jobType: draftFilters.jobType,
      experienceLevel: draftFilters.experienceLevel,
      city: draftFilters.city,
      page: 1,
    });
    onClose();
  };

  const handleClear = () => {
    onReset();
    onClose();
  };

  const filterSection = (title: string, control: React.ReactNode) => (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1, display: 'block' }}>
        {title}
      </Typography>
      {control}
    </Box>
  );

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '85vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Filter Jobs
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close filters">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        {/* Work Mode */}
        {filterSection(
          'Work Mode',
          <FormControl fullWidth size="small">
            <Select
              value={draftFilters.workMode ?? ''}
              onChange={(e) => handleDraftChange('workMode', e.target.value)}
              displayEmpty
            >
              {WORK_MODE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Category / Role */}
        {filterSection(
          'Job Category / Role',
          <FormControl fullWidth size="small">
            <Select
              value={draftFilters.role ?? ''}
              onChange={(e) => handleDraftChange('role', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {(filters?.roles ?? []).map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Experience Level */}
        {filterSection(
          'Experience Level',
          <FormControl fullWidth size="small">
            <Select
              value={draftFilters.experienceLevel ?? ''}
              onChange={(e) => handleDraftChange('experienceLevel', e.target.value)}
              displayEmpty
            >
              {EXP_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Job Type */}
        {filterSection(
          'Employment Type',
          <FormControl fullWidth size="small">
            <Select
              value={draftFilters.jobType ?? ''}
              onChange={(e) => handleDraftChange('jobType', e.target.value)}
              displayEmpty
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Location / City */}
        {filterSection(
          'City / State in India',
          <FormControl fullWidth size="small">
            <Select
              value={draftFilters.city ?? ''}
              onChange={(e) => handleDraftChange('city', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Cities in India</MenuItem>
              {(filters?.cities ?? []).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Footer Actions */}
      <Divider sx={{ borderColor: '#e2e8f0' }} />
      <Box sx={{ p: 2, display: 'flex', gap: 1.5, bgcolor: '#f8fafc' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClear}
          sx={{ py: 1, borderColor: '#cbd5e1', color: 'text.secondary' }}
        >
          Clear All
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleApply}
          sx={{ py: 1 }}
        >
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );
}
