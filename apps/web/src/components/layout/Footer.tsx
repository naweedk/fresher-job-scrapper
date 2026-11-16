'use client';
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WorkIcon from '@mui/icons-material/Work';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f8f9fa',
        borderTop: '1px solid #e8eaed',
        mt: 8,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700 }} color="primary.main">
              Fresher Jobs India
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: { xs: 'left', md: 'center' } }}
          >
            Aggregating genuine entry-level jobs &amp; internships from public sources.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Built as a technical assessment project. Data sourced from public job boards.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
