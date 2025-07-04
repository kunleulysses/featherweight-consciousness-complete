import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Elegant brown
      light: '#A0522D',
      dark: '#654321',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#DEB887', // Beige complement
      light: '#F5DEB3',
      dark: '#CD853F',
      contrastText: '#000000',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E1A0D',
      secondary: '#5D4037',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#2E1A0D',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2E1A0D',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2E1A0D',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#5D4037',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#5D4037',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #8B4513, #A0522D)',
          '&:hover': {
            background: 'linear-gradient(45deg, #654321, #8B4513)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});
