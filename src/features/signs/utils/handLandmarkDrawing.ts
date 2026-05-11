import { HandLandmarker } from '@mediapipe/tasks-vision'

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

function depthStyle(z: number, zMin: number, zMax: number) {
  const span = Math.max(1e-6, zMax - zMin)
  const t = (z - zMin) / span
  const bright = 1 - 0.55 * t
  const fill = `rgba(224, 247, 250, ${0.35 + 0.45 * bright})`
  const stroke = `rgba(0, 191, 216, ${0.65 + 0.3 * bright})`
  return { fill, stroke, lineWidth: 1.5 + 1.2 * bright }
}

export function drawHandLandmarksOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: ReadonlyArray<readonly number[]>,
  width: number,
  height: number,
) {
  if (landmarks.length < 21 || width <= 0 || height <= 0) {
    return
  }

  const zs = landmarks.map((p) => Number(p[2] ?? 0))
  const zMin = Math.min(...zs)
  const zMax = Math.max(...zs)

  const toXY = (idx: number) => {
    const p = landmarks[idx]
    const x = Number(p[0] ?? 0)
    const y = Number(p[1] ?? 0)
    return [x * width, y * height] as const
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const [a, b] of HAND_LANDMARK_INDEX_PAIRS) {
    const [x1, y1] = toXY(a)
    const [x2, y2] = toXY(b)
    const midZ = (Number(landmarks[a][2] ?? 0) + Number(landmarks[b][2] ?? 0)) / 2
    const { stroke, lineWidth } = depthStyle(midZ, zMin, zMax)
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  landmarks.forEach((p, i) => {
    const { fill, stroke, lineWidth } = depthStyle(Number(p[2] ?? 0), zMin, zMax)
    const [x, y] = toXY(i)
    const pz = Number(p[2] ?? 0)
    const r = i === 0 ? 5 : 3.5 + 1.5 * (1 - (pz - zMin) / Math.max(1e-6, zMax - zMin))
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  })
}
