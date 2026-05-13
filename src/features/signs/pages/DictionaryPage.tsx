import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined'
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import SignFeatureLayout, { signCardSx } from '../../../components/SignFeatureLayout'
import type { DictionaryEntry } from '../data/dictionaryEntries'
import { entradasDicionario } from '../data/dictionaryEntries'

export interface DictionaryPageProps {
  token: string | null
  onLogout: () => void
}

function DictionaryEntryCard({ item }: { item: DictionaryEntry }) {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const isVideo = Boolean(item.youtubeVideoId)

  return (
    <Card
      elevation={0}
      sx={{
        ...signCardSx,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2.5,
        height: '100%',
        transition: 'box-shadow 240ms ease, transform 240ms ease, border-color 240ms ease',
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(primary, 0.35),
            boxShadow:
              theme.palette.mode === 'light'
                ? `0 28px 56px -14px ${alpha(theme.palette.common.black, 0.14)}, 0 0 0 1px ${alpha(primary, 0.08)}`
                : `0 28px 56px -14px ${alpha(theme.palette.common.black, 0.55)}, 0 0 0 1px ${alpha(primary, 0.15)}`,
          },
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {isVideo ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              bgcolor: 'grey.900',
              backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.2)} 0%, transparent 40%)`,
            }}
          >
            <Box
              component="iframe"
              src={`https://www.youtube.com/embed/${item.youtubeVideoId}?rel=0`}
              title={item.textoAlternativo ?? `Vídeo do sinal: ${item.termo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          </Box>
        ) : item.imagemSrc ? (
          <CardMedia
            component="img"
            image={item.imagemSrc}
            alt={item.textoAlternativo ?? `Ilustração do sinal: ${item.termo}`}
            sx={(t) => ({
              width: '100%',
              aspectRatio: '4 / 3',
              objectFit: 'contain',
              bgcolor: t.palette.mode === 'dark' ? 'grey.900' : alpha(t.palette.grey[500], 0.08),
            })}
          />
        ) : null}
        <Chip
          size="small"
          icon={isVideo ? <OndemandVideoOutlinedIcon /> : <PhotoOutlinedIcon />}
          label={isVideo ? 'Vídeo' : 'Ilustração'}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            '& .MuiChip-icon': { color: 'primary.main' },
          }}
        />
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 2.5, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          px: { xs: 2.5, sm: 3 },
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: -0.45,
            fontSize: { xs: '1.125rem', sm: '1.1875rem' },
            lineHeight: 1.25,
            color: 'text.primary',
            mb: 1.25,
          }}
        >
          {item.termo}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 3,
            borderRadius: 1,
            bgcolor: 'primary.main',
            opacity: 0.85,
            mb: 1.75,
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
            fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
            flex: 1,
          }}
        >
          {item.significado}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function DictionaryPage({ token: _token, onLogout }: DictionaryPageProps) {
  void _token
  const theme = useTheme()
  const lista = entradasDicionario
  const accent = theme.palette.primary.main

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
            }}
          >
            {lista.map((item) => (
              <DictionaryEntryCard key={item.id} item={item} />
            ))}
          </Box>
        </Stack>
      )}
    </SignFeatureLayout>
  )
}
