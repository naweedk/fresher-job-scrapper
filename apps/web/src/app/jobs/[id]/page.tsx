'use client';
import React, { use, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkIcon from '@mui/icons-material/Link';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { jobsService } from '../../../services/jobs.service';
import type { JobDetail } from '../../../types/api.types';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.2 }}>
      <Box sx={{ color: 'text.secondary', mt: 0.3, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
  OTHER: 'Other',
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  UNKNOWN: 'Unknown',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  FRESHER: 'Fresher (0 years)',
  ZERO_TO_ONE_YEAR: '0–1 Year',
  ONE_TO_TWO_YEARS: '1–2 Years',
  OTHER: 'Entry-level',
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState(id);

  // Reset state during render if route param changes
  if (id !== currentId) {
    setCurrentId(id);
    setLoading(true);
    setNotFound(false);
    setError(null);
  }

  useEffect(() => {
    if (!id) return;
    let active = true;

    jobsService
      .getJob(id)
      .then((data) => {
        if (active) {
          setJob(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!active) return;
        setLoading(false);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(msg || 'Failed to load job details. Please try again.');
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const classification = job?.classification;
  const location = classification?.city ?? job?.location;
  const isClassified = classification?.status === 'COMPLETED';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <MuiLink component={Link} href="/" color="inherit" underline="hover">
              Jobs
            </MuiLink>
            <Typography color="text.primary">
              {loading ? 'Loading...' : job?.title ?? 'Job Details'}
            </Typography>
          </Breadcrumbs>

          {/* Loading Skeleton */}
          {loading && (
            <Box>
              <Skeleton variant="text" width="60%" height={52} />
              <Skeleton variant="text" width="35%" height={32} sx={{ mt: 1 }} />
              <Skeleton variant="rounded" height={240} sx={{ mt: 3, borderRadius: 2 }} />
            </Box>
          )}

          {/* 404 Not Found State */}
          {notFound && (
            <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 3, my: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Job listing not found
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
                This job listing may have been removed, expired, or the link is incorrect.
              </Typography>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="contained" startIcon={<ArrowBackIcon />}>
                  Browse Available Jobs
                </Button>
              </Link>
            </Paper>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Job Details Content */}
          {job && !loading && (
            <Grid container spacing={3.5}>
              {/* Main Content Column */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, bgcolor: '#ffffff' }}>
                  {/* Header: Title, Company, Apply Button */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2,
                      flexWrap: 'wrap',
                      mb: 2.5,
                    }}
                  >
                    <Box sx={{ maxWidth: '100%' }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.4rem', sm: '1.8rem' },
                          lineHeight: 1.25,
                          mb: 1,
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ fontWeight: 500, fontSize: '1.05rem' }}
                        >
                          {job.company.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<OpenInNewIcon />}
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      disableElevation
                      sx={{ py: 1.2, px: 3, fontWeight: 700 }}
                    >
                      Apply Now
                    </Button>
                  </Box>

                  {/* Badges / Chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {classification?.jobType && (
                      <Chip
                        label={JOB_TYPE_LABELS[classification.jobType] ?? classification.jobType}
                        color={classification.jobType === 'INTERNSHIP' ? 'secondary' : 'primary'}
                        variant="outlined"
                      />
                    )}
                    {classification?.workMode && (
                      <Chip
                        label={WORK_MODE_LABELS[classification.workMode] ?? classification.workMode}
                        variant="outlined"
                      />
                    )}
                    {classification?.experienceLevel && (
                      <Chip
                        label={EXPERIENCE_LABELS[classification.experienceLevel] ?? classification.experienceLevel}
                        variant="outlined"
                      />
                    )}
                    {location && (
                      <Chip
                        icon={<LocationOnIcon sx={{ fontSize: '1rem !important' }} />}
                        label={location}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  {/* Job Description */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    About the Role
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.75,
                      color: '#3c4043',
                      fontSize: '0.98rem',
                      mt: 1.5,
                    }}
                  >
                    {job.description}
                  </Typography>

                  {/* Skills Section */}
                  {classification?.skills && classification.skills.length > 0 && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Key Skills &amp; Technologies
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                        {classification.skills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            variant="outlined"
                            sx={{ fontWeight: 500, bgcolor: '#f1f3f4', borderColor: '#dadce0' }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Paper>

                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{ mt: 1 }}
                  >
                    Back to Jobs
                  </Button>
                </Link>
              </Grid>

              {/* Sidebar Info Column */}
              <Grid size={{ xs: 12, md: 4 }}>
                {/* Job Metadata Summary Card */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#ffffff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Overview
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />

                  <InfoRow
                    icon={<WorkIcon fontSize="small" />}
                    label="Employment Type"
                    value={
                      classification?.jobType
                        ? JOB_TYPE_LABELS[classification.jobType] ?? classification.jobType
                        : 'Fresher / Entry-Level'
                    }
                  />

                  <InfoRow
                    icon={<LocationOnIcon fontSize="small" />}
                    label="Job Location"
                    value={location ?? 'India (Location in Description)'}
                  />

                  <InfoRow
                    icon={<ScheduleIcon fontSize="small" />}
                    label="Date Posted"
                    value={formatDate(job.postedAt ?? job.createdAt)}
                  />

                  {job.source && (
                    <InfoRow
                      icon={<LinkIcon fontSize="small" />}
                      label="Source Platform"
                      value={job.source.name}
                    />
                  )}
                </Paper>

                {/* AI Classification Metadata Card */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#ffffff' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    AI Classification
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Classification State
                    </Typography>
                    <Chip
                      label={classification?.status ?? 'PENDING'}
                      size="small"
                      color={isClassified ? 'success' : 'default'}
                      variant={isClassified ? 'filled' : 'outlined'}
                      sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                    />
                  </Box>

                  {isClassified && classification?.role && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Standardized Role
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {classification.role}
                      </Typography>
                    </Box>
                  )}

                  {isClassified && classification?.confidence != null && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Confidence Score
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(classification.confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  )}

                  {!isClassified && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      This job is pending AI classification. Original listing information is displayed above.
                    </Typography>
                  )}
                </Paper>

                {/* Direct External Application Card */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: '#f8f9fa',
                    borderColor: '#dadce0',
                    borderWidth: '1.5px',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Ready to Apply?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    You will be redirected directly to the original job application page on the employer&apos;s website.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<OpenInNewIcon />}
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    disableElevation
                    sx={{ py: 1.2, fontWeight: 700 }}
                  >
                    Apply on Company Website
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
