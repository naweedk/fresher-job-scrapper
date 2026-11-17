'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';

export default function JobCardSkeleton() {
  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#ffffff',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        p: 0,
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1 }}>
        {/* Top Header: Avatar + Company + Location + Date */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={55} height={18} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Job Title */}
        <Skeleton variant="text" width="85%" height={26} sx={{ mb: 1.5 }} />

        {/* Badges Row */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={75} height={22} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Description Preview */}
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} sx={{ mb: 2 }} />

        {/* Skills Chips */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={65} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={55} height={20} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Card Footer: Source badge + Buttons */}
      <CardActions sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
        <Skeleton variant="rounded" width={90} height={20} sx={{ borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={75} height={30} sx={{ borderRadius: 1.5 }} />
          <Skeleton variant="rounded" width={75} height={30} sx={{ borderRadius: 1.5 }} />
        </Box>
      </CardActions>
    </Card>
  );
}
