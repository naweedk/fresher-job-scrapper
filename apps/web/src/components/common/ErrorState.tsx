'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        gap: 2,
      }}
    >
      <Alert severity="error" sx={{ maxWidth: 480, width: '100%' }}>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
}
