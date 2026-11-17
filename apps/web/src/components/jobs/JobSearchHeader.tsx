'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ClearIcon from '@mui/icons-material/Clear';

interface Props {
  searchVal: string;
  cityVal: string;
  onSearch: (search: string, city: string) => void;
}

export default function JobSearchHeader({ searchVal, cityVal, onSearch }: Props) {
  const [prevSearchVal, setPrevSearchVal] = useState(searchVal);
  const [prevCityVal, setPrevCityVal] = useState(cityVal);
  const [localSearch, setLocalSearch] = useState(searchVal);
  const [localCity, setLocalCity] = useState(cityVal);

  if (searchVal !== prevSearchVal) {
    setPrevSearchVal(searchVal);
    setLocalSearch(searchVal);
  }

  if (cityVal !== prevCityVal) {
    setPrevCityVal(cityVal);
    setLocalCity(cityVal);
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(localSearch.trim(), localCity.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box
      component="section"
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        pt: { xs: 3, md: 4 },
        pb: { xs: 3, md: 3.5 },
      }}
    >
      <Container maxWidth="xl">
        {/* Compact Heading */}
        <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.15rem' },
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              mb: 0.75,
            }}
          >
            Find Your First Opportunity
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
              fontWeight: 400,
            }}
          >
            Discover fresher-friendly jobs, internships and entry-level opportunities across India.
          </Typography>
        </Box>

        {/* Unified Search & Location Bar */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            p: { xs: 1, md: 0.75 },
            borderRadius: 3,
            borderColor: '#cbd5e1',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            '&:hover, &:focus-within': {
              borderColor: '#0a66c2',
              boxShadow: '0 0 0 3px rgba(10, 102, 194, 0.12)',
            },
            transition: 'all 0.15s ease-in-out',
            bgcolor: '#ffffff',
          }}
        >
          {/* Input 1: Search Query */}
          <TextField
            fullWidth
            size="small"
            placeholder="Job title, company or skills (e.g. React, SDE, Analyst)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 1, color: 'text.secondary' }}>
                    <SearchIcon sx={{ fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: localSearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setLocalSearch('');
                        onSearch('', localCity.trim());
                      }}
                      edge="end"
                      aria-label="Clear search text"
                    >
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  py: { xs: 0.5, md: 0.75 },
                  px: 1,
                  fontSize: '0.9rem',
                },
              },
            }}
          />

          {/* Desktop Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', md: 'block' }, mx: 1, height: 28, my: 'auto', borderColor: '#e2e8f0' }}
          />

          {/* Input 2: Location / City */}
          <TextField
            fullWidth
            size="small"
            placeholder="City or state (e.g. Bengaluru, Mumbai, Pune, Remote)..."
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            sx={{ maxWidth: { md: 320 } }}
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 1, color: 'text.secondary' }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: localCity ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setLocalCity('');
                        onSearch(localSearch.trim(), '');
                      }}
                      edge="end"
                      aria-label="Clear location text"
                    >
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  py: { xs: 0.5, md: 0.75 },
                  px: 1,
                  fontSize: '0.9rem',
                },
              },
            }}
          />

          {/* Search Action Button */}
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              mt: { xs: 1, md: 0 },
              ml: { md: 1 },
              px: { xs: 2, md: 3.5 },
              py: { xs: 1, md: 1 },
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: 2.25,
              bgcolor: '#0a66c2',
              color: '#ffffff',
              minWidth: { md: 120 },
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#084e96',
              },
            }}
          >
            Find Jobs
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
