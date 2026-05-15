import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import SignFeatureLayout, { signCardSx } from '../../../components/SignFeatureLayout'
import DictionaryEntryCard from '../components/DictionaryEntryCard'
import DictionarySkeletonGrid from '../components/DictionarySkeletonGrid'
import { entradasDicionario } from '../data/dictionaryEntries'

export interface DictionaryPageProps {
  token: string | null
  onLogout: () => void
}

const PAGE_REVEAL_MS = 280

export default function DictionaryPage({ token: _token, onLogout }: DictionaryPageProps) {
  void _token
  const theme = useTheme()
  const lista = entradasDicionario
  const accent = theme.palette.primary.main
  const [pageReady, setPageReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setPageReady(true), PAGE_REVEAL_MS)
    return () => window.clearTimeout(id)
  }, [])

  const showSkeletonGrid = lista.length > 0 && !pageReady

  return (
    <SignFeatureLayout
      onLogout={onLogout}
      title="Dicionário"
      titleHighlight="LIBRAS"
      description={
        <>
          Explore expressões com vídeo ou ilustração e entenda o significado de cada gesto no contexto da conversa.
        </>
      }
    >
      {lista.length === 0 ? (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Paper
            sx={{
              ...signCardSx,
              width: '100%',
              maxWidth: 480,
              p: { xs: 4, sm: 5 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -48,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(accent, 0.12)} 0%, transparent 70%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                mx: 'auto',
                mb: 2.5,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(accent, 0.08),
                border: `1px solid ${alpha(accent, 0.18)}`,
              }}
            >
              <MenuBookOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.9 }} aria-hidden />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.35, mb: 1, position: 'relative' }}>
              Nenhuma entrada ainda
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, position: 'relative', px: 1 }}>
              Inclua termos em <strong>dictionaryEntries.ts</strong> para montar o glossário.
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Stack spacing={{ xs: 3, md: 3.5 }} sx={{ width: '100%', maxWidth: 1920, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: alpha(accent, 0.14),
              bgcolor: alpha(accent, 0.04),
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1.75, minWidth: 0 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(accent, 0.12),
                  color: 'primary.main',
                }}
              >
                <LibraryBooksOutlinedIcon fontSize="small" aria-hidden />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: -0.25, mb: 0.25 }}>
                  Glossário de conversa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, maxWidth: { sm: '56ch' } }}>
                  Gestos ilustrados com significado — use como apoio ao traduzir ou treinar.
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${lista.length} ${lista.length === 1 ? 'expressão' : 'expressões'}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, flexShrink: 0, borderRadius: 2, px: 0.5 }}
            />
          </Paper>

          {showSkeletonGrid ? (
            <DictionarySkeletonGrid count={Math.min(lista.length, 8)} />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2, sm: 2.5, md: 2 },
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                alignItems: 'stretch',
                animation: `dictFadeIn ${PAGE_REVEAL_MS}ms ease-out`,
                '@keyframes dictFadeIn': {
                  from: { opacity: 0, transform: 'translateY(8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {lista.map((item) => (
                <DictionaryEntryCard key={item.id} item={item} />
              ))}
            </Box>
          )}
        </Stack>
      )}
    </SignFeatureLayout>
  )
}
