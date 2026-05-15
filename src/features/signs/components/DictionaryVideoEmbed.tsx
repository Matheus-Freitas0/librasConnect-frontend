import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import { alpha, useTheme } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

interface DictionaryVideoEmbedProps {
  videoId: string
  title: string
}

export default function DictionaryVideoEmbed({ videoId, title }: DictionaryVideoEmbedProps) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) {
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setLoaded(true)
  }

  const showPlaceholder = !loaded

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        bgcolor: 'grey.900',
        overflow: 'hidden',
      }}
    >
      {showPlaceholder && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              position: 'absolute',
              inset: 0,
              height: '100%',
              borderRadius: 0,
              bgcolor: alpha(theme.palette.common.white, 0.06),
            }}
          />
          {inView && (
            <CircularProgress
              size={36}
              thickness={4}
              aria-label="Carregando vídeo"
              sx={{ zIndex: 2, color: 'primary.main' }}
            />
          )}
        </Box>
      )}
      {inView && (
        <Box
          component="iframe"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          onLoad={handleLoad}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 320ms ease-out',
          }}
        />
      )}
    </Box>
  )
}
