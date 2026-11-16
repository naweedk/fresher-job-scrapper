'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', bgcolor: '#ffffff', borderRadius: 3 }}>
          <Typography variant="h1" color="primary.main" sx={{ fontWeight: 800, fontSize: '4.5rem', mb: 1 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
            Page Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            The page or job listing you are looking for does not exist or has been moved.
          </Typography>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" startIcon={<ArrowBackIcon />}>
              Return to Job Search
            </Button>
          </Link>
        </Paper>
      </Container>
    </Box>
  );
}
