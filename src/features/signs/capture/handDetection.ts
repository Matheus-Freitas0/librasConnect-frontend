import type { HandLandmarkerResult, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { MIN_HAND_PRESENCE_SCORE } from '../constants'

function isLandmarkSetPlausible(landmarks: NormalizedLandmark[]): boolean {
  if (landmarks.length < 21) {
    return false
  }
  const wrist = landmarks[0]
  if (!Number.isFinite(wrist.x) || !Number.isFinite(wrist.y)) {
    return false
  }
  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0
  for (const p of landmarks) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const span = Math.max(maxX - minX, maxY - minY)
  return span >= 0.06 && minX >= -0.08 && maxX <= 1.08 && minY >= -0.08 && maxY <= 1.08
}

function isConfidentHand(result: HandLandmarkerResult, index: number): boolean {
  const landmarks = result.landmarks[index]
  if (!landmarks || !isLandmarkSetPlausible(landmarks)) {
    return false
  }
  const score = result.handedness?.[index]?.[0]?.score ?? 0
  return score >= MIN_HAND_PRESENCE_SCORE
}

export function filterConfidentHandsResult(result: HandLandmarkerResult | null): HandLandmarkerResult | null {
  if (!result?.landmarks?.length) {
    return null
  }

  const indices: number[] = []
  for (let i = 0; i < result.landmarks.length; i += 1) {
    if (isConfidentHand(result, i)) {
      indices.push(i)
    }
  }

  if (indices.length === 0) {
    return {
      ...result,
      landmarks: [],
      handedness: [],
      worldLandmarks: result.worldLandmarks ? [] : result.worldLandmarks,
    }
  }

  return {
    ...result,
    landmarks: indices.map((i) => result.landmarks[i]),
    handedness: indices.map((i) => result.handedness[i]),
    worldLandmarks: result.worldLandmarks
      ? indices.map((i) => result.worldLandmarks[i])
      : result.worldLandmarks,
  }
}

export function countConfidentHands(result: HandLandmarkerResult | null): number {
  return filterConfidentHandsResult(result)?.landmarks.length ?? 0
}

export function hasConfidentHands(result: HandLandmarkerResult | null): boolean {
  return countConfidentHands(result) > 0
}
