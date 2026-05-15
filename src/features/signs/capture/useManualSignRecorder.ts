import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { MutableRefObject } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  MANUAL_MIN_CLIP_FRAMES,
  MAX_CLIP_DURATION_MS,
  MIN_CLIP_DURATION_MS,
  MAX_TRANSLATION_SEGMENT_DURATION_MS,
  NO_HANDS_CONFIRM_MS,
  POST_FLUSH_COOLDOWN_MS,
} from '../constants'
import type { ClipPayload } from '../types'
import { detectHandsFromVideo, isVideoFrameRenderable } from './bimanualLandmarker'
import {
  countConfidentHands,
  filterConfidentHandsResult,
  hasConfidentHands,
} from './handDetection'
import { framesFromRecording, type RecordedFrame } from './mapDetectionToClip'

export type ManualSessionPhase = 'idle' | 'armed' | 'recording'

export type ManualSegmentReason = 'hands-gone' | 'max-duration'

export interface UseManualSignRecorderOptions {
  onSegmentReady: (clip: ClipPayload, reason: ManualSegmentReason) => void
  minClipFrames?: number
  maxSegmentDurationMs?: number
  noHandsConfirmMs?: number
}

export interface UseManualSignRecorderResult {
  phase: ManualSessionPhase
  handCount: number
  recordingElapsedMs: number
  recordingProgress: number
  errorMessage: string | null
  latestResultRef: MutableRefObject<HandLandmarkerResult | null>
  start: (videoRef: React.RefObject<HTMLVideoElement | null>) => void
  stop: () => void
  clearError: () => void
}

function clampDurationMs(rawMs: number): number {
  return Math.min(MAX_CLIP_DURATION_MS, Math.max(MIN_CLIP_DURATION_MS, Math.round(rawMs)))
}

export function useManualSignRecorder(
  options: UseManualSignRecorderOptions,
): UseManualSignRecorderResult {
  const {
    onSegmentReady,
    minClipFrames = MANUAL_MIN_CLIP_FRAMES,
    maxSegmentDurationMs = MAX_TRANSLATION_SEGMENT_DURATION_MS,
    noHandsConfirmMs = NO_HANDS_CONFIRM_MS,
  } = options

  const onSegmentReadyRef = useRef(onSegmentReady)
  useEffect(() => {
    onSegmentReadyRef.current = onSegmentReady
  }, [onSegmentReady])

  const [phase, setPhase] = useState<ManualSessionPhase>('idle')
  const [handCount, setHandCount] = useState(0)
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const phaseRef = useRef<ManualSessionPhase>('idle')
  const rafRef = useRef<number | null>(null)
  const videoRef = useRef<React.RefObject<HTMLVideoElement | null> | null>(null)
  const bufferRef = useRef<RecordedFrame[]>([])
  const recordingOriginRef = useRef<number>(0)
  const latestResultRef = useRef<HandLandmarkerResult | null>(null)
  const cooldownUntilRef = useRef<number>(0)
  const requireHandsClearBeforeNextRef = useRef(false)
  const noHandsSinceRef = useRef<number | null>(null)

  const cancelLoop = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const afterSegmentEnded = useCallback((nowInner: number) => {
    requireHandsClearBeforeNextRef.current = true
    cooldownUntilRef.current = nowInner + POST_FLUSH_COOLDOWN_MS
    noHandsSinceRef.current = null
    recordingOriginRef.current = 0
    setRecordingElapsedMs(0)
    phaseRef.current = 'armed'
    setPhase('armed')
  }, [])

  const flushRecording = useCallback(
    (reason: ManualSegmentReason) => {
      const records = bufferRef.current
      bufferRef.current = []
      noHandsSinceRef.current = null

      const nowInner = performance.now()
      const framesWithHand = records.filter((r) => r.result.landmarks.length >= 1).length
      const enoughFrames =
        framesWithHand >= minClipFrames || (reason === 'hands-gone' && framesWithHand >= 1)
      if (!enoughFrames) {
        setErrorMessage('Gesto muito curto ou poucos frames com mão visível.')
        afterSegmentEnded(nowInner)
        return
      }

      const frames = framesFromRecording(records)
      const lastT = frames.length > 0 ? frames[frames.length - 1].t : 0
      const durationMs = clampDurationMs(lastT > 0 ? lastT : MIN_CLIP_DURATION_MS)
      const clip: ClipPayload = { durationMs, frames }
      onSegmentReadyRef.current(clip, reason)
      afterSegmentEnded(nowInner)
    },
    [afterSegmentEnded, minClipFrames],
  )

  const tick = useCallback(async () => {
    if (phaseRef.current !== 'armed' && phaseRef.current !== 'recording') {
      return
    }
    const currentRef = videoRef.current
    const video = currentRef?.current ?? null
    const nowInner = performance.now()

    if (video && isVideoFrameRenderable(video)) {
      try {
        const raw = await detectHandsFromVideo(video, nowInner)
        if (phaseRef.current !== 'armed' && phaseRef.current !== 'recording') {
          return
        }
        const result = filterConfidentHandsResult(raw)
        const confidentCount = countConfidentHands(result)
        latestResultRef.current = confidentCount > 0 ? result : null
        const hasHands = hasConfidentHands(result)
        setHandCount(confidentCount)

        if (requireHandsClearBeforeNextRef.current && !hasHands) {
          requireHandsClearBeforeNextRef.current = false
        }

        const pastCooldown = nowInner >= cooldownUntilRef.current
        const mayStartSegment =
          phaseRef.current === 'armed' &&
          pastCooldown &&
          !requireHandsClearBeforeNextRef.current &&
          hasHands &&
          result

        if (mayStartSegment && result) {
          bufferRef.current = []
          recordingOriginRef.current = nowInner
          bufferRef.current.push({ t: 0, result })
          noHandsSinceRef.current = null
          phaseRef.current = 'recording'
          setPhase('recording')
        } else if (phaseRef.current === 'recording' && recordingOriginRef.current > 0) {
          const origin = recordingOriginRef.current
          const t = nowInner - origin
          const handsPresent = hasConfidentHands(result)

          if (handsPresent && result) {
            bufferRef.current.push({ t, result })
            noHandsSinceRef.current = null
          } else {
            if (noHandsSinceRef.current === null) {
              noHandsSinceRef.current = nowInner
            } else if (nowInner - noHandsSinceRef.current >= noHandsConfirmMs) {
              flushRecording('hands-gone')
            }
          }

          if (phaseRef.current === 'recording' && t >= maxSegmentDurationMs) {
            flushRecording('max-duration')
          }
        }
      } catch {
        cancelLoop()
        setErrorMessage('Falha ao processar a câmera.')
        phaseRef.current = 'idle'
        setPhase('idle')
        bufferRef.current = []
        recordingOriginRef.current = 0
        noHandsSinceRef.current = null
        setRecordingElapsedMs(0)
        return
      }
    } else {
      latestResultRef.current = null
      setHandCount(0)
    }

    if (phaseRef.current !== 'armed' && phaseRef.current !== 'recording') {
      return
    }
    rafRef.current = window.requestAnimationFrame(() => {
      void tick()
    })
  }, [
    cancelLoop,
    flushRecording,
    maxSegmentDurationMs,
    noHandsConfirmMs,
  ])

  const runLoop = useCallback(() => {
    cancelLoop()
    rafRef.current = window.requestAnimationFrame(() => {
      void tick()
    })
  }, [cancelLoop, tick])

  const start = useCallback(
    (ref: React.RefObject<HTMLVideoElement | null>) => {
      videoRef.current = ref
      bufferRef.current = []
      recordingOriginRef.current = 0
      latestResultRef.current = null
      noHandsSinceRef.current = null
      cooldownUntilRef.current = 0
      requireHandsClearBeforeNextRef.current = false
      setHandCount(0)
      setRecordingElapsedMs(0)
      setErrorMessage(null)
      phaseRef.current = 'armed'
      setPhase('armed')
      runLoop()
    },
    [runLoop],
  )

  const stop = useCallback(() => {
    cancelLoop()
    bufferRef.current = []
    recordingOriginRef.current = 0
    noHandsSinceRef.current = null
    cooldownUntilRef.current = 0
    requireHandsClearBeforeNextRef.current = false
    phaseRef.current = 'idle'
    setPhase('idle')
    setHandCount(0)
    setRecordingElapsedMs(0)
    latestResultRef.current = null
  }, [cancelLoop])

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  useEffect(() => {
    if (phase !== 'recording' || recordingOriginRef.current <= 0) {
      return
    }
    const id = window.setInterval(() => {
      setRecordingElapsedMs(performance.now() - recordingOriginRef.current)
    }, 120)
    return () => {
      window.clearInterval(id)
    }
  }, [phase])

  useEffect(() => {
    return () => {
      cancelLoop()
      phaseRef.current = 'idle'
    }
  }, [cancelLoop])

  const recordingProgress =
    maxSegmentDurationMs > 0
      ? Math.min(1, recordingElapsedMs / maxSegmentDurationMs)
      : 0

  return {
    phase,
    handCount,
    recordingElapsedMs,
    recordingProgress,
    errorMessage,
    latestResultRef,
    start,
    stop,
    clearError,
  }
}
