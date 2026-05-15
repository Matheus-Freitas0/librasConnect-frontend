import Box from '@mui/material/Box'
import CardMedia from '@mui/material/CardMedia'
import Skeleton from '@mui/material/Skeleton'
import { alpha, useTheme } from '@mui/material/styles'
import { useState } from 'react'

interface DictionaryImageMediaProps {
  src: string
  alt: string
}

export default function DictionaryImageMedia({ src, alt }: DictionaryImageMediaProps) {
  const theme = useTheme()
  const [loaded, setLoaded] = useState(false)

  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            bgcolor: alpha(theme.palette.grey[500], 0.12),
          }}
        />
      )}
      <CardMedia
        component="img"
        image={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        sx={(t) => ({
          width: '100%',
          height: '100%',
          aspectRatio: '4 / 3',
          objectFit: 'contain',
          bgcolor: t.palette.mode === 'dark' ? 'grey.900' : alpha(t.palette.grey[500], 0.08),
          opacity: loaded ? 1 : 0,
          transition: 'opacity 320ms ease-out',
        })}
      />
    </Box>
  )
}
