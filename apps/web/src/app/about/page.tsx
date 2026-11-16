import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export const metadata = {
  title: 'About — Fresher Jobs India',
  description: 'Learn more about the Fresher Jobs India aggregation and classification platform.',
};

export default function AboutPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Box component="main" sx={{ flex: 1, py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            About Fresher Jobs India
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4 }}>
            Aggregating genuine entry-level opportunities and internships across India.
          </Typography>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, bgcolor: '#ffffff', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Platform Overview
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
              Fresher Jobs India is an automated job discovery platform built to solve the fragmentation of entry-level
              tech hiring in India. It systematically aggregates genuine fresher openings, graduate trainee roles, and
              internships from verified public sources, deduplicates them deterministically, and classifies them using
              Generative AI.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Pipeline Architecture
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 1, mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      1. Permitted Data Collection
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collects listings from authorized public APIs and ATS feeds (Simplify Jobs, Arbeitnow, RemoteOK,
                      Hasjob, Remotive) respecting rate limits and terms.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      2. Clean &amp; Deduplicate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Normalizes URLs, strips tracking parameters, and computes SHA-256 content hashes to detect and
                      eliminate cross-source duplicates.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      3. AI Classification
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uses Google Gemini 2.5 Flash to extract standardized role taxonomy, normalized Indian cities,
                      work arrangements, and skills.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      4. Discovery Experience
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Serves fast, searchable, and filterable results via NestJS REST APIs backed by PostgreSQL and
                      a modern Next.js 16 interface.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Technology Stack
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
              • <strong>Frontend:</strong> Next.js 16 (App Router), React 19, TypeScript, Material UI 9, Emotion<br />
              • <strong>Backend:</strong> NestJS 10, Prisma ORM 5, Class Validator, PostgreSQL 16<br />
              • <strong>Ingestion:</strong> Python 3.13, Pydantic 2, HTTPX, Google Gemini AI (gemini-2.5-flash)
            </Typography>

            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 3 }}>
              This project is developed as a technical assessment for Beep&apos;s Gen AI &amp; Engineering role.
              All aggregated job listings link directly to their respective official application pages.
            </Typography>
          </Paper>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
