import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  spacing: 8,
  shape: {
    borderRadius: 16,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#0A66C2',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#141B2D',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: 'Inter, Segoe UI, Roboto, sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: -0.4,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
