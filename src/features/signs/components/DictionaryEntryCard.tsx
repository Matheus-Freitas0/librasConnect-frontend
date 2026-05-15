import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined'
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { signCardSx } from '../../../components/SignFeatureLayout'
import type { DictionaryEntry } from '../data/dictionaryEntries'
import DictionaryImageMedia from './DictionaryImageMedia'
import DictionaryVideoEmbed from './DictionaryVideoEmbed'

interface DictionaryEntryCardProps {
  item: DictionaryEntry
}

export default function DictionaryEntryCard({ item }: DictionaryEntryCardProps) {
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
        {isVideo && item.youtubeVideoId ? (
          <DictionaryVideoEmbed
            videoId={item.youtubeVideoId}
            title={item.textoAlternativo ?? `Vídeo do sinal: ${item.termo}`}
          />
        ) : item.imagemSrc ? (
          <DictionaryImageMedia
            src={item.imagemSrc}
            alt={item.textoAlternativo ?? `Ilustração do sinal: ${item.termo}`}
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
            zIndex: 3,
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
