import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'

const WASM_PATHS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
  'https://unpkg.com/@mediapipe/tasks-vision@0.10.35/wasm',
]
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const MIN_HAND_DETECTION_CONFIDENCE = 0.5
const MIN_TRACKING_CONFIDENCE = 0.5
const MIN_HAND_PRESENCE_CONFIDENCE = 0.5

let cachedVision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null
let cachedLandmarker: HandLandmarker | null = null

async function getVisionRuntime() {
  if (cachedVision) {
    return cachedVision
  }

  let lastError: unknown = null
  for (const wasmPath of WASM_PATHS) {
    try {
      cachedVision = await FilesetResolver.forVisionTasks(wasmPath)
      return cachedVision
    } catch (error) {
      lastError = error
    }
  }

  throw new Error(`Não foi possível carregar o runtime do MediaPipe. Erro: ${String(lastError)}`)
}

export async function getBimanualHandLandmarker(): Promise<HandLandmarker> {
  if (cachedLandmarker) {
    return cachedLandmarker
  }

  const vision = await getVisionRuntime()

  try {
    cachedLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
      minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
      minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
    })
  } catch {
    cachedLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
      minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
      minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
    })
  }

  return cachedLandmarker
}

export function isVideoFrameRenderable(video: HTMLVideoElement | null): video is HTMLVideoElement {
  if (!video) {
    return false
  }
  return (
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    Number.isFinite(video.videoWidth) &&
    Number.isFinite(video.videoHeight) &&
    video.videoWidth > 0 &&
    video.videoHeight > 0
  )
}

export async function detectHandsFromVideo(
  video: HTMLVideoElement,
  timestamp: number,
): Promise<HandLandmarkerResult | null> {
  if (!isVideoFrameRenderable(video)) {
    return null
  }
  const landmarker = await getBimanualHandLandmarker()
  return landmarker.detectForVideo(video, timestamp)
}

export function closeBimanualHandLandmarker(): void {
  if (!cachedLandmarker) {
    return
  }
  cachedLandmarker.close()
  cachedLandmarker = null
}
