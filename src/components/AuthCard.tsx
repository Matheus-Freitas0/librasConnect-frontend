import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

interface AuthCardProps {
  email: string
  password: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
  error: string | null
}

export default function AuthCard({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  error,
}: AuthCardProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 560, lg: 'min(520px, 100%)', xl: 560 },
        p: { xs: 4, sm: 5, md: 6 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 24px 48px -12px rgba(14, 25, 45, 0.12)'
            : '0 24px 48px -12px rgba(0, 0, 0, 0.45)',
      }}
    >
      <Stack
        spacing={{ xs: 3, md: 3.5, lg: 4 }}
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!loading) onLogin()
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: -0.35,
              mb: 1,
              fontSize: { xs: '1.375rem', sm: '1.5rem', md: '1.625rem' },
            }}
          >
            Entrar
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.65, fontSize: { xs: '0.9375rem', md: '1rem' } }}
          >
            Use seu e-mail e senha para acessar o tradutor de conversa em tempo real.
          </Typography>
        </Box>
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 56, md: 60 } } }}
        />
        <TextField
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 56, md: 60 } } }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    sx={{ minWidth: 48, minHeight: 48 }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="small" color="action" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" color="action" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {error && (
          <Alert severity="error" role="alert" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{
            py: { xs: 1.625, md: 1.75 },
            minHeight: { xs: 54, md: 56 },
            fontSize: { xs: '1rem', md: '1.0625rem' },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
        </Button>
      </Stack>
    </Paper>
  )
}
