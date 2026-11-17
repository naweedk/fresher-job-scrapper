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
import Avatar from '@mui/material/Avatar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkIcon from '@mui/icons-material/Link';
import VerifiedIcon from '@mui/icons-material/Verified';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SecurityIcon from '@mui/icons-material/Security';
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
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.25 }}>
      <Box sx={{ color: '#64748b', mt: 0.25, display: 'flex' }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

import { formatFullDate, formatRelativePostingDate } from '../../../utils/date';

function getCompanyInitials(name: string): string {
  if (!name) return 'FJ';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#0a66c2', '#059669', '#7c3aed', '#d97706',
    '#dc2626', '#0284c7', '#4f46e5', '#0891b2',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-time',
  CONTRACT: 'Contract',
  OTHER: 'Entry-level',
};

const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote (India)',
  HYBRID: 'Hybrid',
  UNKNOWN: 'India',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  FRESHER: 'Fresher (0 yrs)',
  ZERO_TO_ONE_YEAR: '0–1 Year Exp',
  ONE_TO_TWO_YEARS: '1–2 Years Exp',
  OTHER: 'Entry-level',
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentId, setCurrentId] = useState(id);

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

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const classification = job?.classification;
  const location = classification?.city ?? job?.location;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />

      <Box component="main" sx={{ flex: 1, py: { xs: 2.5, md: 4 } }}>
        <Container maxWidth="lg">
          {/* Back Navigation & Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Breadcrumbs sx={{ fontSize: '0.875rem' }}>
              <MuiLink
                component={Link}
                href="/"
                color="inherit"
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                All Jobs
              </MuiLink>
              <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {job?.company?.name ?? 'Company'}
              </Typography>
              <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {loading ? 'Loading...' : job?.title ?? 'Job Details'}
              </Typography>
            </Breadcrumbs>

            <Button
              size="small"
              variant="outlined"
              onClick={handleCopyLink}
              startIcon={copied ? <CheckIcon sx={{ color: '#059669' }} /> : <ContentCopyIcon />}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                borderColor: copied ? '#059669' : '#cbd5e1',
                color: copied ? '#059669' : '#475569',
              }}
            >
              {copied ? 'Link Copied!' : 'Share Job'}
            </Button>
          </Box>

          {/* Loading Skeleton */}
          {loading && (
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
              <Box sx={{ display: 'flex', gap: 2.5, mb: 3 }}>
                <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={38} />
                  <Skeleton variant="text" width="30%" height={24} sx={{ mt: 1 }} />
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
            </Paper>
          )}

          {/* 404 Not Found State */}
          {notFound && (
            <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 3, my: 4, borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: '#0f172a' }}>
                Job listing not found
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3.5, fontSize: '0.95rem' }}>
                This job listing may have expired, reached its applicant limit, or was filled. Explore hundreds of other verified opportunities.
              </Typography>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="contained" startIcon={<ArrowBackIcon />} sx={{ px: 3, py: 1.2, fontWeight: 600 }}>
                  Browse All Jobs
                </Button>
              </Link>
            </Paper>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Job Details Content */}
          {job && !loading && (
            <Box>
              {/* Job Header Hero Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  mb: 3,
                  borderRadius: 3,
                  borderColor: '#e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flexWrap: 'wrap' }}>
                  {/* Company Avatar */}
                  <Avatar
                    sx={{
                      width: { xs: 52, sm: 64 },
                      height: { xs: 52, sm: 64 },
                      bgcolor: getAvatarColor(job.company.name),
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: { xs: '1.2rem', sm: '1.4rem' },
                      borderRadius: 2.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {getCompanyInitials(job.company.name)}
                  </Avatar>

                  {/* Title & Metadata */}
                  <Box sx={{ flex: 1, minWidth: 260 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.75 }}>
                      <Typography
                        variant="h1"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.35rem', sm: '1.75rem' },
                          lineHeight: 1.25,
                          color: '#0f172a',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {job.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: '#334155', fontSize: '1rem' }}
                      >
                        {job.company.name}
                      </Typography>
                      <Box component="span" sx={{ color: '#cbd5e1' }}>•</Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>
                          {location ?? 'India'}
                        </Typography>
                      </Box>
                      <Box component="span" sx={{ color: '#cbd5e1' }}>•</Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <ScheduleIcon sx={{ fontSize: 15 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>
                          {formatRelativePostingDate(job.postedAt, { includePrefix: true }) ?? (job.postedAt ? `Posted ${formatFullDate(job.postedAt)}` : 'Posting date unavailable')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Chips Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
                        label="Verified Indian Role"
                        size="small"
                        sx={{
                          bgcolor: '#ecfdf5',
                          color: '#065f46',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: '1px solid #a7f3d0',
                        }}
                      />
                      {(job.workMode || classification?.workMode) && (
                        <Chip
                          label={
                            WORK_MODE_LABELS[job.workMode || classification?.workMode || ''] ??
                            (job.workMode || classification?.workMode)
                          }
                          size="small"
                          sx={{
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: '1px solid #bfdbfe',
                          }}
                        />
                      )}
                      {classification?.jobType && (
                        <Chip
                          label={JOB_TYPE_LABELS[classification.jobType] ?? classification.jobType}
                          size="small"
                          sx={{
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      {classification?.experienceLevel && (
                        <Chip
                          label={EXPERIENCE_LABELS[classification.experienceLevel] ?? classification.experienceLevel}
                          size="small"
                          sx={{
                            bgcolor: '#f8fafc',
                            color: '#475569',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Header Quick Apply Button (Desktop) */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<OpenInNewIcon />}
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      disableElevation
                      sx={{
                        py: 1.3,
                        px: 3.5,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        borderRadius: 2,
                        bgcolor: '#0a66c2',
                        '&:hover': { bgcolor: '#084e96' },
                      }}
                    >
                      Apply Now
                    </Button>
                  </Box>
                </Box>
              </Paper>

              {/* 2-Column Desktop Grid Layout */}
              <Grid container spacing={3}>
                {/* Main Content Column (Left - 68%) */}
                <Grid size={{ xs: 12, md: 8 }}>
                  {/* Job Description Card */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 2.5, sm: 3.5 },
                      mb: 3,
                      borderRadius: 3,
                      borderColor: '#e2e8f0',
                      bgcolor: '#ffffff',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#0f172a', mb: 2, fontSize: '1.15rem' }}
                    >
                      About the Role
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-line',
                        lineHeight: 1.8,
                        color: '#334155',
                        fontSize: '0.95rem',
                      }}
                    >
                      {job.description}
                    </Typography>

                    {/* Required Skills Section */}
                    {classification?.skills && classification.skills.length > 0 && (
                      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, fontSize: '1rem' }}
                        >
                          Key Skills &amp; Technologies
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {classification.skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                bgcolor: '#f1f5f9',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                borderRadius: 1.5,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Source Verification Note */}
                    <Box
                      sx={{
                        mt: 4,
                        p: 2,
                        bgcolor: '#f8fafc',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <SecurityIcon sx={{ fontSize: 20, color: '#059669', mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                          Verified Direct Ingestion
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                          This job was scraped directly from {job.source?.name ?? 'the official company career site'}. Fresher Jobs India verifies that listings are located in India and connects you straight to the employer&apos;s application portal without intermediaries.
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Sidebar Info Column (Right - 32%) */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                    {/* Primary Apply Action Card */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        borderColor: '#e2e8f0',
                        bgcolor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.75 }}>
                        Ready to Apply?
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
                        You will be redirected directly to {job.company.name}&apos;s official application form.
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
                        sx={{
                          py: 1.4,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          borderRadius: 2,
                          bgcolor: '#0a66c2',
                          '&:hover': { bgcolor: '#084e96' },
                          mb: 1.5,
                        }}
                      >
                        Apply on Company Site
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        size="medium"
                        onClick={handleCopyLink}
                        startIcon={copied ? <CheckIcon sx={{ color: '#059669' }} /> : <ContentCopyIcon />}
                        sx={{
                          py: 1,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          borderColor: copied ? '#059669' : '#cbd5e1',
                          color: copied ? '#059669' : '#475569',
                          '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        }}
                      >
                        {copied ? 'Link Copied to Clipboard!' : 'Copy Job Link'}
                      </Button>
                    </Paper>

                    {/* Quick Metadata Summary Card */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        borderColor: '#e2e8f0',
                        bgcolor: '#ffffff',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>
                        Job Overview
                      </Typography>
                      <Divider sx={{ mb: 1, borderColor: '#f1f5f9' }} />

                      <InfoRow
                        icon={<BusinessIcon fontSize="small" />}
                        label="Company"
                        value={job.company.name}
                      />

                      <InfoRow
                        icon={<LocationOnOutlinedIcon fontSize="small" />}
                        label="Location"
                        value={location ?? 'India (Multiple Cities)'}
                      />

                      <InfoRow
                        icon={<WorkOutlineOutlinedIcon fontSize="small" />}
                        label="Work Mode"
                        value={
                          (job.workMode || classification?.workMode)
                            ? WORK_MODE_LABELS[job.workMode || classification?.workMode || ''] ?? (job.workMode || classification?.workMode)
                            : 'On-site (India)'
                        }
                      />

                      <InfoRow
                        icon={<WorkOutlineOutlinedIcon fontSize="small" />}
                        label="Employment Type"
                        value={
                          classification?.jobType
                            ? JOB_TYPE_LABELS[classification.jobType] ?? classification.jobType
                            : 'Fresher / Entry-Level'
                        }
                      />

                      <InfoRow
                        icon={<ScheduleIcon fontSize="small" />}
                        label="Original Posting Date"
                        value={job.postedAt ? `${formatFullDate(job.postedAt)} (${formatRelativePostingDate(job.postedAt)})` : 'Posting date unavailable'}
                      />

                      {job.sourceUpdatedAt && (
                        <InfoRow
                          icon={<ScheduleIcon fontSize="small" />}
                          label="Source Last Updated"
                          value={formatFullDate(job.sourceUpdatedAt)}
                        />
                      )}

                      {job.firstSeenAt && (
                        <InfoRow
                          icon={<ScheduleIcon fontSize="small" />}
                          label="First Discovered"
                          value={formatFullDate(job.firstSeenAt)}
                        />
                      )}

                      {job.source && (
                        <InfoRow
                          icon={<LinkIcon fontSize="small" />}
                          label="Platform Source"
                          value={job.source.name}
                        />
                      )}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Mobile Sticky Bottom Bar for Direct Application */}
      {job && !loading && (
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            p: 2,
            zIndex: 1100,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<OpenInNewIcon />}
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            disableElevation
            sx={{
              py: 1.4,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 2,
              bgcolor: '#0a66c2',
              '&:hover': { bgcolor: '#084e96' },
            }}
          >
            Apply on Company Site
          </Button>
        </Box>
      )}

      <Footer />
    </Box>
  );
}
