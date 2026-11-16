import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import PsychologyIcon from '@mui/icons-material/Psychology';

/**
 * Homepage for Fresher Jobs India.
 * Phase 1: Foundation only — no live job data yet.
 */
export default function HomePage() {
  const techStack = [
    { icon: <CodeIcon fontSize="small" />, label: 'Next.js 15 + React 19' },
    { icon: <StorageIcon fontSize="small" />, label: 'NestJS + PostgreSQL' },
    { icon: <PsychologyIcon fontSize="small" />, label: 'Gemini AI (Phase 2)' },
  ];

  const phases = [
    {
      phase: 'Phase 1',
      title: 'Project Foundation',
      status: 'active',
      description:
        'Monorepo setup, Next.js frontend, NestJS API, PostgreSQL schema, Python ingestion environment.',
    },
    {
      phase: 'Phase 2',
      title: 'Data Collection & AI Classification',
      status: 'planned',
      description:
        'Scrape 200+ fresher jobs from permitted public sources, deduplicate, classify by role and city using Gemini.',
    },
    {
      phase: 'Phase 3',
      title: 'Search & Discovery UI',
      status: 'planned',
      description:
        'Full job listing dashboard with filters, search, pagination and daily auto-update pipeline.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <WorkIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Fresher Jobs India
            </Typography>
            <Chip
              label="Phase 1 — Foundation"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Hero section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}
          >
            Fresher Jobs India
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ color: 'text.secondary', fontWeight: 400, mb: 3 }}
          >
            A job aggregation platform for entry-level positions and internships
            across India — powered by AI classification and daily automated
            updates.
          </Typography>

          {/* Tech stack chips */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {techStack.map((item) => (
              <Chip
                key={item.label}
                icon={item.icon}
                label={item.label}
                variant="outlined"
                size="small"
                sx={{ borderColor: 'divider', color: 'text.secondary' }}
              />
            ))}
          </Stack>
        </Box>
      </Container>

      {/* Development status */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: '#EEF2FF',
            border: '1px solid',
            borderColor: '#C7D2FE',
          }}
          elevation={0}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mt: 0.75,
                flexShrink: 0,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'primary.dark' }}
              >
                Development in progress — Phase 1 Active
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.dark', mt: 0.5 }}>
                The project foundation is being built. This includes the monorepo
                architecture, database schema, API layer and Python ingestion
                environment. No live job data is available yet.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Phase roadmap */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}
        >
          Implementation Roadmap
        </Typography>

        <Stack spacing={2}>
          {phases.map((item) => (
            <Paper
              key={item.phase}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: item.status === 'active' ? 'primary.main' : 'divider',
                borderLeftWidth: item.status === 'active' ? 4 : 1,
              }}
              elevation={0}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center', mb: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {item.phase}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
                <Chip
                  label={item.status === 'active' ? 'In Progress' : 'Planned'}
                  size="small"
                  color={item.status === 'active' ? 'primary' : 'default'}
                  variant={item.status === 'active' ? 'filled' : 'outlined'}
                  sx={{ flexShrink: 0 }}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: 3,
          backgroundColor: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Fresher Jobs India — Beep Gen AI &amp; Engineering Technical Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phase 1 Foundation
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
