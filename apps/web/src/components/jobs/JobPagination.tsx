'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import type { PaginationMeta } from '../../types/api.types';

interface Props {
  pagination: PaginationMeta;
  onChange: (page: number) => void;
}

export default function JobPagination({ pagination, onChange }: Props) {
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 4,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {start}–{end} of {total.toLocaleString('en-IN')} jobs
      </Typography>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => onChange(p)}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}
