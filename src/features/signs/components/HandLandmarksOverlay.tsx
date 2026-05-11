import Box from '@mui/material/Box'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'
import { drawHandLandmarksOnCanvas } from '../utils/handLandmarkDrawing'

interface HandLandmarksOverlayProps {
  videoElement: HTMLVideoElement | null
  resultRef: MutableRefObject<HandLandmarkerResult | null>
  active: boolean
}

export default function HandLandmarksOverlay({ videoElement, resultRef, active }: HandLandmarksOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoElement) {
      return undefined
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return undefined
    }

    const resizeToVideo = () => {
      const vw = videoElement.clientWidth
      const vh = videoElement.clientHeight
      if (vw <= 0 || vh <= 0) {
        return
      }
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2.5)
      const bw = Math.round(vw * dpr)
      const bh = Math.round(vh * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
    }

    const clearCanvas = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const ro = new ResizeObserver(() => {
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
      resizeToVideo()
      const vw = videoElement.clientWidth
      const vh = videoElement.clientHeight
      if (vw <= 0 || vh <= 0) {
        return
      }
      const dpr = canvas.width / vw

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, vw, vh)

      const r = resultRef.current
      if (r && r.landmarks && r.landmarks.length > 0) {
        for (let i = 0; i < r.landmarks.length; i++) {
          drawHandLandmarksOnCanvas(
            ctx,
            r.landmarks[i].map((p) => [p.x, p.y, p.z ?? 0]),
            vw,
            vh,
          )
        }
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
  }, [videoElement, resultRef, active])

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
