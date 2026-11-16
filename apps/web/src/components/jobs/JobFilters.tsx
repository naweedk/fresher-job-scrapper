'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import type { FiltersResponse, JobsQueryParams } from '../../types/api.types';

const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  FRESHER: 'Fresher',
  ZERO_TO_ONE_YEAR: '0-1 Year',
  ONE_TO_TWO_YEARS: '1-2 Years',
  OTHER: 'Other',
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  UNKNOWN: 'Unknown',
};

function getLabelMap(type: string): Record<string, string> {
  if (type === 'jobType') return JOB_TYPE_LABELS;
  if (type === 'experienceLevel') return EXPERIENCE_LABELS;
  if (type === 'workMode') return WORK_MODE_LABELS;
  return {};
}

interface FilterSelectProps {
  label: string;
  field: string;
  options: string[];
  value: string | undefined;
  onChange: (field: string, val: string) => void;
  labelMap?: Record<string, string>;
}

function FilterSelect({
  label,
  field,
  options,
  value,
  onChange,
  labelMap,
}: FilterSelectProps) {
  const selectId = `filter-${field}-select`;
  const labelId = `filter-${field}-label`;

  return (
    <FormControl size="small" fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={selectId}
        value={value ?? ''}
        label={label}
        onChange={(e) => onChange(field, e.target.value as string)}
      >
        <MenuItem value="">
          <em>All {label}s</em>
        </MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface Props {
  filters: FiltersResponse | null;
  activeFilters: JobsQueryParams;
  onChange: (filters: Partial<JobsQueryParams>) => void;
  onReset: () => void;
}

function FiltersContent({ filters, activeFilters, onChange, onReset }: Props) {
  const hasActive = Object.entries(activeFilters).some(([k, v]) => {
    if (!v) return false;
    if (k === 'page' && v === 1) return false;
    if (k === 'limit' && v === 20) return false;
    if (k === 'sortBy' && v === 'createdAt') return false;
    if (k === 'sortOrder' && v === 'DESC') return false;
    return true;
  });

  const handleChange = (field: string, val: string) => {
    onChange({ [field]: val || undefined, page: 1 });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        {hasActive && (
          <Button size="small" onClick={onReset} color="primary">
            Clear all
          </Button>
        )}
      </Box>

      <FilterSelect
        label="Role"
        field="role"
        options={filters?.roles ?? []}
        value={activeFilters.role}
        onChange={handleChange}
      />
      <FilterSelect
        label="City"
        field="city"
        options={filters?.cities ?? []}
        value={activeFilters.city}
        onChange={handleChange}
      />
      <FilterSelect
        label="Job Type"
        field="jobType"
        options={filters?.jobTypes ?? []}
        value={activeFilters.jobType}
        onChange={handleChange}
        labelMap={getLabelMap('jobType')}
      />
      <FilterSelect
        label="Experience"
        field="experienceLevel"
        options={filters?.experienceLevels ?? []}
        value={activeFilters.experienceLevel}
        onChange={handleChange}
        labelMap={getLabelMap('experienceLevel')}
      />
      <FilterSelect
        label="Work Mode"
        field="workMode"
        options={filters?.workModes ?? []}
        value={activeFilters.workMode}
        onChange={handleChange}
        labelMap={getLabelMap('workMode')}
      />
    </Box>
  );
}

export default function JobFilters(props: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          startIcon={<FilterListIcon />}
          variant="outlined"
          size="small"
          onClick={() => setDrawerOpen(true)}
        >
          Filters
        </Button>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                p: 3,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '80vh',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <CloseIcon />
            </IconButton>
          </Box>
          <FiltersContent {...props} />
        </Drawer>
      </>
    );
  }

  return (
    <Box sx={{ width: 240, flexShrink: 0 }}>
      <FiltersContent {...props} />
    </Box>
  );
}
