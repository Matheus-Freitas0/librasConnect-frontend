import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { Link as RouterLink, useLocation } from 'react-router-dom'

interface AppNavbarProps {
  onLogout: () => void
}

const NAV_LINKS = [
  { to: '/translator', label: 'Tradutor' },
  { to: '/training', label: 'Treinar conversa' },
] as const

export default function AppNavbar({ onLogout }: AppNavbarProps) {
  const theme = useTheme()
  const { pathname } = useLocation()
  const isActive = (to: string) =>
    to === '/training' ? pathname.startsWith('/training') : pathname === to

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.04)}, ${alpha(theme.palette.primary.main, 0.04)})`,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          maxWidth: 1920,
          width: '100%',
          mx: 'auto',
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3, md: 'clamp(72px, 8vw, 110px)' },
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box
          component={RouterLink}
          to="/translator"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0,
            minWidth: 0,
          }}
          aria-label="Libras Connect — tradutor"
        >
          <Box
            component="img"
            src="/loginImg.png"
            alt=""
            sx={{
              width: { xs: 40, sm: 44 },
              height: 'auto',
              borderRadius: 2,
              display: 'block',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: -0.35,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            }}
          >
            Libras{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Connect
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to)
              return (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="text"
                  color="inherit"
                  sx={{
                    fontWeight: 600,
                    minHeight: 48,
                    px: 1.5,
                    color: active ? 'primary.main' : 'inherit',
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  }}
                >
                  {link.label}
                </Button>
              )
            })}
          </Box>
          <Button
            variant="text"
            color="inherit"
            startIcon={<LogoutOutlinedIcon />}
            onClick={onLogout}
            sx={{
              fontWeight: 600,
              minHeight: 48,
              px: { xs: 1, sm: 1.5 },
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Sair
          </Button>
          <IconButton
            color="inherit"
            aria-label="Sair da conta"
            onClick={onLogout}
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 48, minHeight: 48 }}
          >
            <LogoutOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
