'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0a66c2', // Professional LinkedIn/Linear-style deep royal blue
      light: '#e8f0fe',
      dark: '#084e96',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669', // Emerald green
      light: '#ecfdf5',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Modern subtle slate background
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#475569', // Slate 600
      disabled: '#94a3b8', // Slate 400
    },
    divider: '#e2e8f0', // Slate 200
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#b45309',
    },
    info: {
      main: '#0284c7',
      light: '#e0f2fe',
      dark: '#0369a1',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.025em', color: '#0f172a' },
    h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.02em', color: '#0f172a' },
    h3: { fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.015em', color: '#0f172a' },
    h4: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em', color: '#0f172a' },
    h5: { fontWeight: 600, fontSize: '1.125rem', color: '#0f172a' },
    h6: { fontWeight: 600, fontSize: '1rem', color: '#0f172a' },
    subtitle1: { fontSize: '0.95rem', fontWeight: 500, color: '#475569' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: '#475569' },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: '#0f172a' },
    body2: { fontSize: '0.84375rem', lineHeight: 1.5, color: '#475569' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: '#64748b' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '7px 16px',
          transition: 'all 0.15s ease-in-out',
        },
        contained: {
          backgroundColor: '#0a66c2',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#084e96',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#cbd5e1',
          color: '#334155',
          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f1f5f9',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
          borderRadius: 6,
          height: 24,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        outlined: {
          borderColor: '#e2e8f0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0a66c2',
            borderWidth: 1.5,
          },
        },
        input: {
          padding: '9px 14px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingTop: 8,
          paddingBottom: 8,
          fontSize: '0.875rem',
        },
      },
    },
  },
});
