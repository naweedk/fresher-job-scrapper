'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JobListItem } from '../../types/api.types';
import { formatRelativePostingDate } from '../../utils/date';

function getWorkModeBadge(mode?: string) {
  const m = (mode || '').toUpperCase();
  if (m === 'REMOTE') {
    return { label: 'Remote', color: '#6d28d9', bgcolor: '#f5f3ff', border: '#ddd6fe' };
  }
  if (m === 'HYBRID') {
    return { label: 'Hybrid', color: '#0f766e', bgcolor: '#f0fdfa', border: '#99f6e4' };
  }
  if (m === 'ONSITE') {
    return { label: 'On-site', color: '#0369a1', bgcolor: '#f0f9ff', border: '#bae6fd' };
  }
  return null;
}

function getJobTypeBadge(jobType?: string) {
  const t = (jobType || '').toUpperCase();
  if (t === 'INTERNSHIP') {
    return { label: 'Internship', color: '#b45309', bgcolor: '#fffbeb', border: '#fde68a' };
  }
  if (t === 'FULL_TIME') {
    return { label: 'Full-time', color: '#047857', bgcolor: '#ecfdf5', border: '#a7f3d0' };
  }
  if (t === 'CONTRACT') {
    return { label: 'Contract', color: '#334155', bgcolor: '#f8fafc', border: '#e2e8f0' };
  }
  return null;
}

function getExpBadge(exp?: string) {
  const e = (exp || '').toUpperCase();
  if (e === 'FRESHER') {
    return { label: 'Fresher (0 yrs)', color: '#059669', bgcolor: '#ecfdf5', border: '#a7f3d0' };
  }
  if (e === 'ZERO_TO_ONE_YEAR') {
    return { label: '0–1 Year', color: '#0284c7', bgcolor: '#f0f9ff', border: '#bae6fd' };
  }
  if (e === 'ONE_TO_TWO_YEARS') {
    return { label: '1–2 Years', color: '#475569', bgcolor: '#f8fafc', border: '#e2e8f0' };
  }
  return { label: 'Entry Level', color: '#059669', bgcolor: '#ecfdf5', border: '#a7f3d0' };
}

// Generate deterministic avatar background color from company name
function getAvatarBg(name: string): string {
  const colors = ['#0a66c2', '#059669', '#d97706', '#7c3aed', '#0284c7', '#dc2626', '#475569'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface Props {
  job: JobListItem;
}

export default function JobCard({ job }: Props) {
  const router = useRouter();
  const { classification } = job;
  const companyName = job.company?.name || 'Hiring Company';
  const location = classification?.city ?? job.location ?? 'India';
  const workModeBadge = getWorkModeBadge(job.workMode || classification?.workMode);
  const jobTypeBadge = getJobTypeBadge(classification?.jobType);
  const expBadge = getExpBadge(classification?.experienceLevel);
  const skills = classification?.skills ?? [];
  const postedText = formatRelativePostingDate(job.postedAt);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid navigation if clicked inside button or anchor
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    router.push(`/jobs/${job.id}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      onClick={handleCardClick}
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          borderColor: '#94a3b8',
          boxShadow: '0 6px 20px -4px rgba(15, 23, 42, 0.08)',
          transform: 'translateY(-2px)',
          '& .job-title': {
            color: 'primary.main',
          },
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header: Avatar + Company + Location + Date */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          {job.company?.logoUrl ? (
            <Avatar
              src={job.company.logoUrl}
              alt={companyName}
              variant="rounded"
              sx={{ width: 40, height: 40, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
            />
          ) : (
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: getAvatarBg(companyName),
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              {companyName.charAt(0).toUpperCase()}
            </Avatar>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: '#334155',
                fontSize: '0.84rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {companyName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 13, color: '#64748b', flexShrink: 0 }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {location}
              </Typography>
            </Box>
          </Box>

          {/* Posted Date */}
          {postedText && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
              <ScheduleIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 500 }}>
                {postedText}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Job Title */}
        <Typography
          className="job-title"
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.35,
            color: '#0f172a',
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.15s ease',
          }}
        >
          {job.title}
        </Typography>

        {/* Metadata Badges */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {expBadge && (
            <Chip
              label={expBadge.label}
              size="small"
              sx={{
                color: expBadge.color,
                bgcolor: expBadge.bgcolor,
                border: `1px solid ${expBadge.border}`,
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          )}

          {workModeBadge && (
            <Chip
              label={workModeBadge.label}
              size="small"
              sx={{
                color: workModeBadge.color,
                bgcolor: workModeBadge.bgcolor,
                border: `1px solid ${workModeBadge.border}`,
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          )}

          {jobTypeBadge && (
            <Chip
              label={jobTypeBadge.label}
              size="small"
              sx={{
                color: jobTypeBadge.color,
                bgcolor: jobTypeBadge.bgcolor,
                border: `1px solid ${jobTypeBadge.border}`,
                fontWeight: 600,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
          )}
        </Box>

        {/* Skills Chips */}
        {skills.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.6, mt: 'auto', pt: 1 }}>
            {skills.slice(0, 3).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.72rem',
                  height: 20,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0',
                }}
              />
            ))}
            {skills.length > 3 && (
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600 }}>
                +{skills.length - 3} more
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Card Footer: Source Info & Actions */}
      <CardActions
        sx={{
          px: 2.5,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#f8fafc',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        <Link
          href={`/jobs/${job.id}`}
          style={{ textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="small"
            variant="text"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              p: 0,
              minWidth: 'auto',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Details
          </Button>
        </Link>

        <Button
          size="small"
          variant="contained"
          color="primary"
          endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
          onClick={handleApplyClick}
          sx={{
            py: 0.5,
            px: 1.5,
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: 1.5,
            boxShadow: 'none',
          }}
        >
          Apply Now
        </Button>
      </CardActions>
    </Card>
  );
}
