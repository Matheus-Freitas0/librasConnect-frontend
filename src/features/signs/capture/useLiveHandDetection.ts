import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { detectHandsFromVideo, isVideoFrameRenderable } from './bimanualLandmarker'
import { countConfidentHands, filterConfidentHandsResult } from './handDetection'

export interface LiveHandDetectionResult {
  latestResultRef: MutableRefObject<HandLandmarkerResult | null>
  handCount: number
}

export function useLiveHandDetection(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  enabled: boolean,
): LiveHandDetectionResult {
  const latestResultRef = useRef<HandLandmarkerResult | null>(null)
  const [handCount, setHandCount] = useState(0)

  useEffect(() => {
    if (!enabled) {
      latestResultRef.current = null
      const timerId = window.setTimeout(() => {
        setHandCount(0)
      }, 0)
      return () => window.clearTimeout(timerId)
    }

    let rafId: number | null = null
    let cancelled = false
    let inFlight = false

    const schedule = () => {
      if (!cancelled) {
        rafId = window.requestAnimationFrame(loop)
      }
    }

    const loop = () => {
      schedule()

      if (inFlight) {
        return
      }

      const video = videoRef.current
      if (!video || !isVideoFrameRenderable(video)) {
        latestResultRef.current = null
        setHandCount((prev) => (prev === 0 ? prev : 0))
        return
      }

      inFlight = true
      void detectHandsFromVideo(video, performance.now())
        .then((raw) => {
          if (cancelled) {
            return
          }
          const result = filterConfidentHandsResult(raw)
          const count = countConfidentHands(result)
          latestResultRef.current = count > 0 ? result : null
          setHandCount((prev) => (prev === count ? prev : count))
        })
        .catch(() => {
          if (!cancelled) {
            latestResultRef.current = null
            setHandCount((prev) => (prev === 0 ? prev : 0))
          }
        })
        .finally(() => {
          inFlight = false
        })
    }

    schedule()

    return () => {
      cancelled = true
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      latestResultRef.current = null
      setHandCount(0)
    }
  }, [enabled, videoRef])

  return { latestResultRef, handCount }
}
