import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HandLandmarksOverlay from './HandLandmarksOverlay'
import HeadPositionGuide from './HeadPositionGuide'

interface CameraDevice {
  deviceId: string
  label: string
}

interface CameraPermissionState {
  granted: boolean
  blocked: boolean
  loading: boolean
}

interface CameraFeedProps {
  disabled: boolean
  onReady: (video: HTMLVideoElement) => void
  resultRef: MutableRefObject<HandLandmarkerResult | null>
  showHandLandmarks: boolean
  fillHeight?: boolean
  showHeadPositionGuide?: boolean
}

const defaultPermission: CameraPermissionState = {
  granted: false,
  blocked: false,
  loading: false,
}

export default function CameraFeed({
  disabled,
  onReady,
  resultRef,
  showHandLandmarks,
  fillHeight = false,
  showHeadPositionGuide = false,
}: CameraFeedProps) {
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [permission, setPermission] = useState(defaultPermission)
  const [error, setError] = useState<string | null>(null)

  const hasCameraApi = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    [],
  )

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const readDevices = useCallback(async () => {
    const deviceList = await navigator.mediaDevices.enumerateDevices()
    const cameras = deviceList
      .filter((item) => item.kind === 'videoinput')
      .map((item, index) => ({
        deviceId: item.deviceId,
        label: item.label || `Câmera ${index + 1}`,
      }))

    setDevices(cameras)
    setSelectedDeviceId((prev) => prev || cameras[0]?.deviceId || '')
  }, [])

  const waitForVideoDimensions = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    const track = stream.getVideoTracks()[0]
    const ready = () => {
      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        return true
      }
      const s = track?.getSettings()
      return Boolean(s?.width && s?.height && s.width > 0 && s.height > 0)
    }
    if (ready() && video.videoWidth > 0 && video.videoHeight > 0) {
      return Promise.resolve()
    }
    return new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup()
        reject(new Error('Tempo esgotado aguardando a câmera.'))
      }, 15000)
      let rafCount = 0
      const maxRaf = 150
      let rafId = 0
      const tryResolve = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          cleanup()
          resolve()
          return
        }
        if (rafCount < maxRaf) {
          rafCount += 1
          rafId = window.requestAnimationFrame(tryResolve)
        }
      }
      const onMeta = () => tryResolve()
      const cleanup = () => {
        clearTimeout(timeoutId)
        if (rafId !== 0) {
          window.cancelAnimationFrame(rafId)
        }
        video.removeEventListener('loadedmetadata', onMeta)
        video.removeEventListener('loadeddata', onMeta)
        video.removeEventListener('resize', onMeta)
        video.removeEventListener('canplay', onMeta)
      }
      video.addEventListener('loadedmetadata', onMeta)
      video.addEventListener('loadeddata', onMeta)
      video.addEventListener('resize', onMeta)
      video.addEventListener('canplay', onMeta)
      tryResolve()
    })
  }, [])

  const startCamera = useCallback(async (deviceId?: string) => {
    if (!hasCameraApi || !videoRef.current) {
      setError('Câmera não suportada neste navegador.')
      return
    }

    try {
      setPermission((prev) => ({ ...prev, loading: true }))
      setError(null)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const videoConstraints: MediaTrackConstraints = deviceId
        ? {
            deviceId: { exact: deviceId },
            width: { ideal: 960 },
            height: { ideal: 540 },
          }
        : {
            width: { ideal: 960 },
            height: { ideal: 540 },
            facingMode: 'user',
          }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      })

      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      await waitForVideoDimensions(videoRef.current, stream)
      await readDevices()

      setPermission({ granted: true, blocked: false, loading: false })
      onReadyRef.current(videoRef.current)
    } catch (unknownError) {
      setPermission({ granted: false, blocked: true, loading: false })
      const message =
        unknownError instanceof Error && unknownError.message.includes('Tempo esgotado')
          ? 'A câmera demorou para iniciar. Tente outra vez.'
          : 'Permissão de câmera negada ou indisponível.'
      setError(message)
    }
  }, [hasCameraApi, readDevices, waitForVideoDimensions])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void startCamera()
    }, 0)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [startCamera])

  const handleCameraChange = (event: SelectChangeEvent) => {
    const nextId = event.target.value
    setSelectedDeviceId(nextId)
    void startCamera(nextId)
  }

  return (
    <Stack
      spacing={fillHeight ? 1 : 2}
      sx={
        fillHeight
          ? {
              height: '100%',
              minHeight: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }
          : undefined
      }
    >
      <Snackbar open={!hasCameraApi} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Seu navegador não suporta acesso à câmera.
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!permission.granted && !permission.loading && !error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
          Ative a câmera para continuar.
        </Alert>
      </Snackbar>

      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'grey.900',
          minHeight: fillHeight ? 0 : 320,
          flex: fillHeight ? 1 : undefined,
          display: fillHeight ? 'flex' : undefined,
          flexDirection: fillHeight ? 'column' : undefined,
        }}
      >
        <Box
          component="video"
          ref={(element: HTMLVideoElement | null) => {
            videoRef.current = element
            setVideoNode(element)
          }}
          muted
          playsInline
          autoPlay
          sx={{
            display: 'block',
            width: '100%',
            height: fillHeight ? '100%' : 'auto',
            minHeight: fillHeight ? 0 : undefined,
            flex: fillHeight ? '1 1 0' : undefined,
            objectFit: fillHeight ? 'cover' : undefined,
            opacity: disabled ? 0.65 : 1,
            transition: 'opacity 150ms ease-in-out',
          }}
        />
        {showHeadPositionGuide && <HeadPositionGuide />}
        <HandLandmarksOverlay videoElement={videoNode} resultRef={resultRef} active={showHandLandmarks} />
      </Box>

      {devices.length > 1 && (
        <FormControl size="small" sx={{ flexShrink: 0 }}>
          <InputLabel id="camera-device-label">Câmera</InputLabel>
          <Select
            labelId="camera-device-label"
            value={selectedDeviceId}
            label="Câmera"
            onChange={handleCameraChange}
          >
            {devices.map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  )
}
