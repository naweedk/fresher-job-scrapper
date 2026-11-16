'use client';

import { Box, Paper, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

interface ErrorBoundaryDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Reusable error display component.
 * Compatible with Next.js App Router error.tsx boundaries.
 */
export default function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorBoundaryDisplayProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 480,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'error.light',
          borderRadius: 2,
        }}
      >
        <ErrorOutlineIcon
          sx={{ fontSize: 48, color: 'error.main', mb: 2 }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        {onRetry && (
          <Button variant="outlined" color="error" onClick={onRetry} size="small">
            Try again
          </Button>
        )}
      </Paper>
    </Box>
  );
}
