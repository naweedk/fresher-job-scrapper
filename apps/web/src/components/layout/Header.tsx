'use client';
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '';
  const isAbout = pathname === '/about';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 56, sm: 60 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Brand Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Fresher Jobs
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  India
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button
                  size="small"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    fontWeight: isHome ? 600 : 500,
                    color: isHome ? 'primary.main' : 'text.secondary',
                    bgcolor: isHome ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: isHome ? 'primary.light' : '#f1f5f9',
                      color: 'primary.main',
                    },
                  }}
                >
                  Find Jobs
                </Button>
              </Link>
              <Link href="/about" style={{ textDecoration: 'none' }}>
                <Button
                  size="small"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    fontWeight: isAbout ? 600 : 500,
                    color: isAbout ? 'primary.main' : 'text.secondary',
                    bgcolor: isAbout ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: isAbout ? 'primary.light' : '#f1f5f9',
                      color: 'primary.main',
                    },
                  }}
                >
                  About
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Right: Status indicator & Mobile Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* <Chip
              icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
              label="Verified Indian Jobs"
              size="small"
              sx={{
                bgcolor: '#ecfdf5',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '0.72rem',
                border: '1px solid #a7f3d0',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            /> */}

            {/* Mobile Hamburger */}
            <IconButton
              size="small"
              sx={{ display: { md: 'none' }, color: 'text.secondary' }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: 260, p: 2, bgcolor: '#ffffff' },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Fresher Jobs India
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href="/"
              onClick={() => setDrawerOpen(false)}
              selected={isHome}
              sx={{
                borderRadius: 1.5,
                '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 },
              }}
            >
              <WorkOutlineOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: isHome ? 'primary.main' : 'text.secondary' }} />
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: isHome ? 600 : 500 }}>
                    Find Jobs
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              href="/about"
              onClick={() => setDrawerOpen(false)}
              selected={isAbout}
              sx={{
                borderRadius: 1.5,
                '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600 },
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1.5, color: isAbout ? 'primary.main' : 'text.secondary' }} />
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: isAbout ? 600 : 500 }}>
                    About
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '12px !important', color: '#059669 !important' }} />}
            label="Verified Indian Jobs Only"
            size="small"
            sx={{
              width: '100%',
              bgcolor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 600,
              fontSize: '0.72rem',
              border: '1px solid #a7f3d0',
            }}
          />
        </Box>
      </Drawer>
    </AppBar>
  );
}
