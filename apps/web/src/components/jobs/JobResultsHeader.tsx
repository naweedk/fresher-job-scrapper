'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { PaginationMeta } from '../../types/api.types';

interface Props {
  pagination: PaginationMeta | null;
  loading: boolean;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'createdAt', sortOrder: 'DESC' },
  { label: 'Recently Posted', sortBy: 'postedAt', sortOrder: 'DESC' },
  { label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'ASC' },
  { label: 'Company A–Z', sortBy: 'company', sortOrder: 'ASC' },
  { label: 'Job Title A–Z', sortBy: 'title', sortOrder: 'ASC' },
];

export default function JobResultsHeader({
  pagination,
  loading,
  sortBy,
  sortOrder,
  onSortChange,
}: Props) {
  const currentVal = `${sortBy}__${sortOrder}`;

  const renderCountText = () => {
    if (loading) return 'Searching verified opportunities...';
    if (!pagination || pagination.total === 0) return '0 opportunities found';

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);

    return `Showing ${start}–${end} of ${pagination.total.toLocaleString('en-IN')} verified jobs`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
        mt: 1,
      }}
    >
      {/* Title & Count */}
      <Box>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.05rem', sm: '1.2rem' },
            color: '#0f172a',
            letterSpacing: '-0.01em',
          }}
        >
          Explore Opportunities
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          {renderCountText()}
        </Typography>
      </Box>

      {/* Sort Select */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: { xs: 'none', sm: 'inline' } }}>
          Sort by:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={currentVal}
            onChange={(e) => {
              const [sb, so] = (e.target.value as string).split('__');
              onSortChange(sb, so);
            }}
            IconComponent={KeyboardArrowDownIcon}
            sx={{
              height: 36,
              bgcolor: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 500,
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#cbd5e1',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#94a3b8',
              },
              '& .MuiSelect-select': {
                py: 0.75,
                px: 1.25,
                pr: '28px !important',
              },
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem
                key={`${opt.sortBy}__${opt.sortOrder}`}
                value={`${opt.sortBy}__${opt.sortOrder}`}
                sx={{ fontSize: '0.82rem' }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
