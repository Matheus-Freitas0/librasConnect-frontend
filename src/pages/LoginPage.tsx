import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { loginUser } from '../services/authService'
import { setToken } from '../services/tokenStorage'

interface LoginPageProps {
  onAuthenticated: (token: string) => void
}

export default function LoginPage({ onAuthenticated }: LoginPageProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await loginUser({ email, password })
      setToken(response.token)
      onAuthenticated(response.token)
      navigate('/translator', { replace: true })
    } catch {
      setError('Não foi possível entrar. Verifique e-mail e senha e tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  const accent = theme.palette.primary.main

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 55% at 12% -8%, ${alpha(accent, 0.22)}, transparent 55%),
            radial-gradient(ellipse 70% 50% at 96% 8%, ${alpha(accent, 0.14)}, transparent 52%),
            radial-gradient(ellipse 60% 40% at 50% 100%, ${alpha(theme.palette.common.black, 0.03)}, transparent 50%)
          `,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1920,
          flex: 1,
          position: 'relative',
          zIndex: 1,
          px: { xs: 3, sm: 5, md: 'clamp(72px, 8vw, 110px)', lg: 'clamp(88px, 9vw, 110px)' },
          py: { xs: 4, sm: 5, md: 'clamp(32px, 5vh, 80px)', lg: 'clamp(48px, 8vh, 96px)' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid
          container
          columnSpacing={{ xs: 0, md: 4, lg: 6, xl: 8 }}
          rowSpacing={{ xs: 6, md: 5, lg: 7 }}
          sx={{ width: '100%', alignItems: 'center' }}
        >
          <Grid size={{ xs: 12, md: 12, lg: 7 }}>
            <Stack
              spacing={{ xs: 3.5, sm: 4, md: 4.5, lg: 5 }}
              sx={{
                width: '100%',
                maxWidth: { lg: 720 },
                mx: { xs: 'auto', lg: 0 },
                alignItems: { xs: 'center', lg: 'flex-start' },
              }}
            >
              <Box
                component="img"
                src="/loginImg.png"
                alt="Ícone de comunicação em Libras — mãos em gesto"
                sx={{
                  display: 'block',
                  width: { xs: 'clamp(148px, 42vw, 200px)', sm: 'clamp(168px, 36vw, 220px)', md: 'clamp(200px, 28vw, 260px)', lg: 'clamp(220px, 24vw, 300px)' },
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.28)}`,
                }}
              />
              <Box
                sx={{
                  width: '100%',
                  textAlign: { xs: 'center', lg: 'left' },
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: {
                      xs: 'clamp(2rem, 7vw, 2.5rem)',
                      sm: 'clamp(2.25rem, 5.5vw, 2.85rem)',
                      md: 'clamp(2.75rem, 4.2vw, 3.5rem)',
                      lg: 'clamp(3rem, 3.4vw, 3.875rem)',
                    },
                    fontWeight: 800,
                    letterSpacing: { xs: -0.75, lg: -1 },
                    lineHeight: 1.12,
                    color: 'text.primary',
                    mb: { xs: 2, md: 2.5 },
                    maxWidth: { xs: '36ch', sm: '40ch', md: 'none' },
                    mx: { xs: 'auto', lg: 0 },
                  }}
                >
                  Libras{' '}
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Connect
                  </Box>
                </Typography>
                <Typography
                  component="p"
                  color="text.secondary"
                  sx={{
                    fontSize: {
                      xs: 'clamp(1rem, 3.8vw, 1.0625rem)',
                      sm: '1.0625rem',
                      md: 'clamp(1.0625rem, 1.2vw, 1.25rem)',
                      lg: '1.125rem',
                    },
                    lineHeight: 1.7,
                    maxWidth: { xs: '38ch', sm: '42ch', md: 560, lg: 600 },
                    mx: { xs: 'auto', lg: 0 },
                  }}
                >
                  Acesse sua conta para treinar expressões de conversa em LIBRAS e usar o tradutor assistido em tempo real.
                </Typography>
                <Box
                  sx={{
                    mt: { xs: 3, md: 4, lg: 5 },
                    height: { xs: 4, lg: 5 },
                    width: { xs: 72, sm: 88, lg: 104 },
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    opacity: 0.85,
                    alignSelf: { xs: 'center', lg: 'flex-start' },
                    mx: { xs: 'auto', lg: 0 },
                    '@media (prefers-reduced-motion: no-preference)': {
                      animation: 'fadeInBar 420ms ease-out both',
                    },
                    '@keyframes fadeInBar': {
                      from: { opacity: 0, transform: 'translateX(-8px)' },
                      to: { opacity: 0.85, transform: 'translateX(0)' },
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 12, lg: 5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'stretch', lg: 'flex-end', xl: 'center' },
                width: '100%',
                pl: { xl: 2 },
              }}
            >
              <AuthCard
                email={email}
                password={password}
                loading={loading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onLogin={handleLogin}
                error={error}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
