import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import { useCallback, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

interface AppNavbarProps {
  onLogout: () => void
}

const NAV_LINKS = [
  { to: '/translator', label: 'Tradutor', icon: TranslateOutlinedIcon },
  { to: '/training', label: 'Treinar conversa', icon: SchoolOutlinedIcon },
  { to: '/dicionario', label: 'Dicionário', icon: MenuBookOutlinedIcon },
] as const

export default function AppNavbar({ onLogout }: AppNavbarProps) {
  const theme = useTheme()
  const { pathname } = useLocation()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (to: string) =>
    to === '/training'
      ? pathname.startsWith('/training')
      : to === '/dicionario'
        ? pathname.startsWith('/dicionario')
        : pathname === to

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  if (isMdUp && drawerOpen) {
    setDrawerOpen(false)
  }

  const handleLogout = () => {
    closeDrawer()
    onLogout()
  }

  return (
    <>
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
            gap: 1.5,
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              flex: { xs: 1, md: '0 1 auto' },
            }}
          >
            <Box
              component={RouterLink}
              to="/translator"
              onClick={closeDrawer}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.25, sm: 2 },
                textDecoration: 'none',
                color: 'inherit',
                minWidth: 0,
              }}
              aria-label="Libras Connect — tradutor"
            >
              <Box
                component="img"
                src="/loginImg.png"
                alt=""
                sx={{
                  width: { xs: 36, sm: 44 },
                  height: 'auto',
                  borderRadius: 2,
                  display: 'block',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  flexShrink: 0,
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
                  fontSize: { xs: '0.9375rem', sm: '1.125rem', md: '1.25rem' },
                }}
              >
                Libras{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Connect
                </Box>
              </Typography>
            </Box>
          </Box>

          {!isMdUp && (
            <IconButton
              color="inherit"
              edge="end"
              aria-label="Abrir menu de navegação"
              aria-expanded={drawerOpen}
              aria-controls="app-nav-drawer"
              onClick={() => setDrawerOpen(true)}
              sx={{ flexShrink: 0, minWidth: 48, minHeight: 48 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {isMdUp && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
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
              <Button
                variant="text"
                color="inherit"
                startIcon={<LogoutOutlinedIcon />}
                onClick={onLogout}
                sx={{ fontWeight: 600, minHeight: 48, px: 1.5, ml: 0.5 }}
              >
                Sair
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        id="app-nav-drawer"
        anchor="right"
        open={drawerOpen && !isMdUp}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: {
              width: 'min(100%, 320px)',
              pt: 1,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Box component="nav" aria-label="Navegação principal" sx={{ px: 1, pb: 2 }}>
          <List disablePadding>
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to)
              const Icon = link.icon
              return (
                <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={RouterLink}
                    to={link.to}
                    selected={active}
                    onClick={closeDrawer}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Icon color={active ? 'primary' : 'inherit'} fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={link.label}
                      slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9375rem' } } }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <Divider sx={{ my: 1 }} />
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{ borderRadius: 2, py: 1.25, color: 'text.secondary' }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sair"
                  slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.9375rem' } } }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  )
}
