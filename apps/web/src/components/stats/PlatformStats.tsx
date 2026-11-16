'use client';
import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import { statsService } from '../../services/stats.service';
import type { StatsResponse } from '../../types/api.types';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ bgcolor: '#ffffff', height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 2.5, px: 2, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, mb: 0.5 }}>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function PlatformStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    statsService
      .getStats()
      .then((data) => {
        if (mounted) setStats(data);
      })
      .catch(() => {
        if (mounted) setStats(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={105} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<WorkIcon sx={{ fontSize: 28 }} />}
          value={stats.activeJobs}
          label="Active Freshers Jobs"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<BusinessIcon sx={{ fontSize: 28 }} />}
          value={stats.totalCompanies}
          label="Verified Companies"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<SchoolIcon sx={{ fontSize: 28 }} />}
          value={stats.byJobType?.internships ?? 0}
          label="Internships"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<PublicIcon sx={{ fontSize: 28 }} />}
          value={stats.byWorkMode?.remote ?? 0}
          label="Remote Opportunities"
        />
      </Grid>
    </Grid>
  );
}
