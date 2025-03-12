import { createTheme } from  '@mui/material/styles';

export const christmasTheme = createTheme({
  palette: {
    primary: {
      main: '#008000', // Green
    },
    secondary: {
      main: '#dc004e', // Red
    },
    background: {
      default: '#ffffff', // White background
    },
    text: {
      primary: '#000', // White text
      secondary: '#dc004e', // Red text
    },
  },
});

export const springTheme = createTheme({
  palette: {
    primary: {
      main: '#98c379', // Fresh spring green
      light: '#c3e88d',
      dark: '#6b8e4e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4a261', // Soft peach
      light: '#f7b98b',
      dark: '#d17c3c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#e8f0e8', // Slightly darker light green
      paper: '#fafafa',   // Off-white for better contrast
    },
    text: {
      primary: '#2d2d2d',   // Darker gray for main text
      secondary: '#5a5a5a', // Darker medium gray for secondary text
    },
    error: {
      main: '#e06c75', // Soft coral
    },
    warning: {
      main: '#e5c07b', // Warm yellow
    },
    info: {
      main: '#62b0d9', // Sky blue
    },
    success: {
      main: '#98c379', // Matches primary green
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
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
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(152, 195, 121, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(152, 195, 121, 0.15)',
        },
      },
    },
  },
});