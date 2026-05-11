import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'

type EllipseLayout = {
  cx: number
  cy: number
  rx: number
  ry: number
  irx: number
  iry: number
  shoulderY: number
}

function ellipseFromLayoutAspect(ar: number): EllipseLayout {
  if (ar > 1.2) {
    return { cx: 50, cy: 45, rx: 12, ry: 18, irx: 15, iry: 10, shoulderY: 50 }
  }
  if (ar > 0.92) {
    return { cx: 50, cy: 45, rx: 12, ry: 18, irx: 15, iry: 10, shoulderY: 50 }
  }
  if (ar > 0.62) {
    return { cx: 50, cy: 45, rx: 18, ry: 30, irx: 15, iry: 10, shoulderY: 50 }
  }
  return { cx: 50, cy: 45, rx: 20, ry: 30, irx: 15, iry: 10, shoulderY: 50 }
}

export default function HeadPositionGuide() {
  const theme = useTheme()
  const rootRef = useRef<HTMLDivElement>(null)
  const [layoutAspect, setLayoutAspect] = useState(1)
  const stroke = alpha(theme.palette.primary.main, 0.5)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      if (r.height > 0.5) setLayoutAspect(r.width / r.height)
    }
    update()
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const g = ellipseFromLayoutAspect(layoutAspect)

  return (
    <Box
      ref={rootRef}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <ellipse
          cx={g.cx}
          cy={g.cy}
          rx={g.rx}
          ry={g.ry}
          fill="none"
          stroke={stroke}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />

      </Box>
      <Typography
        variant="caption"
        component="p"
        role="note"
        sx={{
          position: 'relative',
          zIndex: 2,
          mx: 'auto',
          mb: { xs: 1, sm: 1.25 },
          px: 1.5,
          py: 0.75,
          maxWidth: 'min(92%, 360px)',
          textAlign: 'center',
          lineHeight: 1.45,
          color: 'common.white',
          bgcolor: alpha(theme.palette.common.black, 0.48),
          borderRadius: 2,
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.75rem' },
        }}
      >
        Para uma melhor experiência, mantenha o rosto centralizado na elipse.
      </Typography>
    </Box>
  )
}
