import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { useTheme } from '@mui/material/styles'
import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import { drawHandLandmarksOnCanvas } from '../utils/handLandmarkDrawing'
import { getVideoDisplayMapping } from '../utils/videoDisplayMapping'

interface HandLandmarksOverlayProps {
  videoElement: HTMLVideoElement | null
  resultRef: MutableRefObject<HandLandmarkerResult | null>
  active: boolean
}

export default function HandLandmarksOverlay({ videoElement, resultRef, active }: HandLandmarksOverlayProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true })
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoElement) {
      return undefined
    }

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) {
      return undefined
    }

    const maxDpr = isMobile ? 1.5 : 2

    const resizeToVideo = () => {
      const vw = videoElement.clientWidth
      const vh = videoElement.clientHeight
      if (vw <= 0 || vh <= 0) {
        return false
      }
      if (sizeRef.current.w === vw && sizeRef.current.h === vh) {
        return true
      }
      sizeRef.current = { w: vw, h: vh }
      const dpr = Math.min(window.devicePixelRatio ?? 1, maxDpr)
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      return true
    }

    const clearCanvas = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const ro = new ResizeObserver(() => {
      sizeRef.current = { w: 0, h: 0 }
      resizeToVideo()
    })
    ro.observe(videoElement)

    if (!active) {
      resizeToVideo()
      clearCanvas()
      return () => {
        ro.disconnect()
      }
    }

    const frame = () => {
      rafRef.current = window.requestAnimationFrame(frame)
      if (!resizeToVideo()) {
        return
      }

      const vw = videoElement.clientWidth
      const vh = videoElement.clientHeight
      const dpr = canvas.width / vw

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, vw, vh)

      const r = resultRef.current
      if (!r?.landmarks?.length) {
        return
      }

      const mapping = getVideoDisplayMapping(videoElement)

      for (let i = 0; i < r.landmarks.length; i += 1) {
        const hand = r.landmarks[i]
        drawHandLandmarksOnCanvas(ctx, hand, mapping, isMobile)
      }
    }

    resizeToVideo()
    rafRef.current = window.requestAnimationFrame(frame)

    return () => {
      ro.disconnect()
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      clearCanvas()
    }
  }, [videoElement, resultRef, active, isMobile])

  if (!videoElement) {
    return null
  }

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}
