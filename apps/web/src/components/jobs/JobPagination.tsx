'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import type { PaginationMeta } from '../../types/api.types';

interface Props {
  pagination: PaginationMeta;
  onChange: (page: number) => void;
}

export default function JobPagination({ pagination, onChange }: Props) {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    onChange(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 4,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        borderColor: '#e2e8f0',
        bgcolor: '#ffffff',
      }}
    >
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
        Showing <Box component="span" sx={{ fontWeight: 700, color: '#0f172a' }}>{start}–{end}</Box> of{' '}
        <Box component="span" sx={{ fontWeight: 700, color: '#0f172a' }}>{total.toLocaleString('en-IN')}</Box> verified jobs
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        size="medium"
        sx={{
          '& .MuiPaginationItem-root': {
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: 1.5,
          },
          '& .Mui-selected': {
            bgcolor: '#0a66c2 !important',
            color: '#ffffff',
          },
        }}
      />
    </Paper>
  );
}
