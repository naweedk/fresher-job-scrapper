'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface Props {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = 'No jobs found',
  message = 'Try adjusting your search or filters.',
  onReset,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        {message}
      </Typography>
      {onReset && (
        <Button variant="outlined" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </Box>
  );
}
