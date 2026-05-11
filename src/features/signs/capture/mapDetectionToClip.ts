import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { FrameSample, HandRole, LandmarkPoint, RawHand } from '../types'

export interface RecordedFrame {
  t: number
  result: HandLandmarkerResult
}

function mapHandRole(handCategory: string | undefined): HandRole {
  return handCategory === 'Left' ? 'left' : 'right'
}

export function mapResultToFrameSample(t: number, result: HandLandmarkerResult): FrameSample {
  const hands: RawHand[] = []
  for (let i = 0; i < result.landmarks.length; i += 1) {
    const lm = result.landmarks[i]
    const landmarks = lm.map((p) => [p.x, p.y, p.z ?? 0] as LandmarkPoint)
    const handCategory = result.handedness[i]?.[0]?.categoryName
    const role = mapHandRole(handCategory)
    hands.push({ role, landmarks })
  }
  return { t, hands }
}

export function framesFromRecording(records: RecordedFrame[]): FrameSample[] {
  return records.map((record) => mapResultToFrameSample(record.t, record.result))
}
