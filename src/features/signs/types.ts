export type LandmarkPoint = [number, number, number]

export type HandRole = 'left' | 'right'

export interface RawHand {
  role: HandRole
  landmarks: LandmarkPoint[]
}

export interface FrameSample {
  t: number
  hands: RawHand[]
}

export interface ClipPayload {
  durationMs: number
  frames: FrameSample[]
}

export interface SubmitTrainingSampleInput extends ClipPayload {
  label: string
  description?: string
}

export interface SampleMeta {
  id: string
  signId: string
  createdAt: string
  durationMs: number
  frameCount: number
}

export type RecognizeResponse =
  | { recognized: true; sign: { id: string; label: string } }
  | { recognized: false; message?: string }
