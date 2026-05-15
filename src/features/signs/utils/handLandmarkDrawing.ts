import { HandLandmarker } from '@mediapipe/tasks-vision'
import type { VideoDisplayMapping } from './videoDisplayMapping'

function normalizeConnections(list: typeof HandLandmarker.HAND_CONNECTIONS): ReadonlyArray<readonly [number, number]> {
  return list.map((item): readonly [number, number] => {
    if (Array.isArray(item)) {
      return [item[0], item[1]] as const
    }
    const entry = item as { start: number; end: number }
    return [entry.start, entry.end] as const
  })
}

const HAND_LANDMARK_INDEX_PAIRS = normalizeConnections(HandLandmarker.HAND_CONNECTIONS)

const STROKE = 'rgba(0, 191, 216, 0.82)'
const FILL = 'rgba(224, 247, 250, 0.88)'

export function drawHandLandmarksOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: ReadonlyArray<{ x: number; y: number }>,
  mapping: VideoDisplayMapping,
  compact = false,
) {
  if (landmarks.length < 21) {
    return
  }

  const { map } = mapping
  const lineWidth = compact ? 1 : 1.15
  const wristR = compact ? 3 : 3.5
  const jointR = compact ? 2 : 2.25

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = STROKE
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  for (const [a, b] of HAND_LANDMARK_INDEX_PAIRS) {
    const [x1, y1] = map(landmarks[a].x, landmarks[a].y)
    const [x2, y2] = map(landmarks[b].x, landmarks[b].y)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
  }

  ctx.stroke()

  ctx.fillStyle = FILL
  ctx.beginPath()

  for (let i = 0; i < landmarks.length; i += 1) {
    const [x, y] = map(landmarks[i].x, landmarks[i].y)
    const r = i === 0 ? wristR : jointR
    ctx.moveTo(x + r, y)
    ctx.arc(x, y, r, 0, Math.PI * 2)
  }

  ctx.fill()
}
