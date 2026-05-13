import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { SxProps, Theme } from '@mui/material/styles'
import { alpha, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import AppNavbar from './AppNavbar'

export const signCardSx: SxProps<Theme> = {
  elevation: 0,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  boxShadow: (theme: Theme) =>
    theme.palette.mode === 'light'
      ? '0 24px 48px -12px rgba(14, 25, 45, 0.12)'
      : '0 24px 48px -12px rgba(0, 0, 0, 0.45)',
}

interface SignFeatureLayoutProps {
  onLogout: () => void
  title: string
  titleHighlight?: string
  description: ReactNode
  children: ReactNode
  fillViewport?: boolean
}

export default function SignFeatureLayout({
  onLogout,
  title,
  titleHighlight,
  description,
  children,
  fillViewport = false,
}: SignFeatureLayoutProps) {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const viewportLocked = Boolean(
    fillViewport && useMediaQuery(theme.breakpoints.up('md'), { noSsr: true }),
  )
  const compactHeader = fillViewport && !viewportLocked

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        ...(fillViewport && viewportLocked
          ? {
              height: '100dvh',
              maxHeight: '100dvh',
              overflow: 'hidden',
            }
          : fillViewport && !viewportLocked
            ? {
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
              }
            : {
                height: 'auto',
                maxHeight: 'none',
                overflow: 'hidden',
              }),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
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
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: fillViewport && viewportLocked ? 1 : undefined,
          minHeight: fillViewport && viewportLocked ? 0 : undefined,
          overflow: fillViewport && viewportLocked ? 'hidden' : 'visible',
        }}
      >
        <AppNavbar onLogout={onLogout} />
        <Container
          maxWidth={false}
          component="main"
          sx={{
            maxWidth: 1920,
            flex: fillViewport && viewportLocked ? 1 : undefined,
            minHeight: fillViewport && viewportLocked ? 0 : undefined,
            position: 'relative',
            zIndex: 1,
            px: { xs: 3, sm: 5, md: 'clamp(72px, 8vw, 110px)', lg: 'clamp(88px, 9vw, 110px)' },
            py: fillViewport
              ? compactHeader
                ? { xs: 2, sm: 2 }
                : { xs: 1.5, sm: 2, md: 2 }
              : { xs: 3, sm: 4, md: 'clamp(28px, 4vh, 56px)', lg: 'clamp(36px, 5vh, 72px)' },
            display: fillViewport && viewportLocked ? 'flex' : 'block',
            flexDirection: fillViewport && viewportLocked ? 'column' : undefined,
            overflow: fillViewport && viewportLocked ? 'hidden' : 'visible',
            pb: fillViewport && !viewportLocked ? { xs: 4, sm: 5 } : undefined,
          }}
        >
          <Stack
            spacing={
              fillViewport
                ? compactHeader
                  ? { xs: 2, sm: 2.25, md: 2 }
                  : { xs: 1.25, sm: 1.5, md: 2 }
                : { xs: 3, sm: 3.5, md: 4 }
            }
            sx={
              fillViewport && viewportLocked
                ? { flex: 1, minHeight: 0, overflow: 'hidden' }
                : undefined
            }
          >
            <Stack
              spacing={fillViewport ? (compactHeader ? { xs: 1, md: 1 } : { xs: 0.75, md: 1 }) : { xs: 1.5, md: 2 }}
              sx={{
                maxWidth: { md: 880, lg: 960 },
                flexShrink: 0,
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: fillViewport
                    ? compactHeader
                      ? {
                          xs: 'clamp(1.5rem, 5vw, 1.85rem)',
                          sm: 'clamp(1.55rem, 4vw, 1.9rem)',
                          md: 'clamp(1.65rem, 2vw, 2rem)',
                        }
                      : {
                          xs: 'clamp(1.35rem, 4vw, 1.65rem)',
                          sm: 'clamp(1.5rem, 3vw, 1.85rem)',
                          md: 'clamp(1.65rem, 2vw, 2rem)',
                        }
                    : {
                        xs: 'clamp(1.65rem, 5.2vw, 2rem)',
                        sm: 'clamp(1.85rem, 4vw, 2.35rem)',
                        md: 'clamp(2rem, 2.8vw, 2.65rem)',
                      },
                  fontWeight: 800,
                  letterSpacing: { xs: -0.5, md: -0.65 },
                  lineHeight: 1.15,
                  color: 'text.primary',
                }}
              >
                {title}
                {titleHighlight ? (
                  <>
                    {' '}
                    <Box component="span" sx={{ color: 'primary.main' }}>
                      {titleHighlight}
                    </Box>
                  </>
                ) : null}
              </Typography>
              <Typography
                component="div"
                color="text.secondary"
                sx={{
                  fontSize: fillViewport
                    ? compactHeader
                      ? {
                          xs: '0.9375rem',
                          sm: '1rem',
                          md: '1rem',
                        }
                      : {
                          xs: '0.875rem',
                          sm: '0.9375rem',
                          md: '1rem',
                        }
                    : {
                        xs: 'clamp(0.9375rem, 3.5vw, 1rem)',
                        sm: 'clamp(1rem, 2vw, 1.0625rem)',
                        md: 'clamp(1.0625rem, 1.2vw, 1.125rem)',
                      },
                  lineHeight: 1.65,
                  maxWidth: { xs: '100%', sm: '52ch', md: '56ch' },
                  ...(fillViewport && viewportLocked
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }
                    : {}),
                  '& strong': { color: 'text.primary', fontWeight: 600 },
                }}
              >
                {description}
              </Typography>
              <Box
                sx={{
                  mt: fillViewport ? (compactHeader ? 0.5 : 0.25) : { xs: 0.5, md: 1 },
                  height: { xs: 3, md: 4 },
                  width: { xs: 56, sm: 72, md: 88 },
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  opacity: 0.85,
                }}
              />
            </Stack>
            <Box
              sx={
                fillViewport && viewportLocked
                  ? {
                      width: '100%',
                      flex: 1,
                      minHeight: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }
                  : fillViewport && !viewportLocked
                    ? {
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible',
                      }
                    : { width: '100%' }
              }
            >
              {children}
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
