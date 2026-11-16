'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: number;
  fullPage?: boolean;
}

/**
 * Reusable loading component.
 * When fullPage is true, it fills the viewport height.
 */
export default function Loading({
  message = 'Loading…',
  size = 40,
  fullPage = false,
}: LoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullPage ? '100vh' : 240,
        color: 'text.secondary',
      }}
    >
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
