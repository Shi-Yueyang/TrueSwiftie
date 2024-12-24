import { createTheme } from  '@mui/material/styles';

const christmasTheme = createTheme({
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
  typography: {
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
  },
});

export default christmasTheme;