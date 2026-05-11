import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { MutableRefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { detectHandsFromVideo, isVideoFrameRenderable } from './bimanualLandmarker'

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

    const tick = async () => {
      if (cancelled) {
        return
      }
      const video = videoRef.current
      if (video && isVideoFrameRenderable(video)) {
        try {
          const result = await detectHandsFromVideo(video, performance.now())
          if (!cancelled) {
            latestResultRef.current = result
            setHandCount(result?.landmarks?.length ?? 0)
          }
        } catch {
          latestResultRef.current = null
          setHandCount(0)
        }
      } else if (!cancelled) {
        latestResultRef.current = null
        setHandCount(0)
      }
      if (!cancelled) {
        rafId = window.requestAnimationFrame(() => {
          void tick()
        })
      }
    }

    rafId = window.requestAnimationFrame(() => {
      void tick()
    })

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
