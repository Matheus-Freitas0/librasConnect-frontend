import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import SignFeatureLayout, { signCardSx } from '../../../components/SignFeatureLayout'
import { recognizeClip } from '../api/signsApi'
import { MAX_SIGN_SEGMENT_DURATION_MS } from '../constants'
import { useManualSignRecorder } from '../capture/useManualSignRecorder'
import BimanualBadge from '../components/BimanualBadge'
import CameraFeed from '../components/CameraFeed'
import SignCameraCard from '../components/SignCameraCard'
import type { ClipPayload } from '../types'
import { speakTranslation } from '../services/speechService'

const PT_BR = 'pt-BR'

function sentenceCaseFirstCharOnly(text: string): string {
  const s = text.trim()
  if (!s) return ''
  const lower = s.toLocaleLowerCase(PT_BR)
  const head = lower[0]
  return (head ? head.toLocaleUpperCase(PT_BR) : '') + lower.slice(1)
}

function appendToConversationBody(body: string, fragment: string): string {
  const raw = fragment.trim()
  if (!raw) return body
  const b = body.trimEnd()
  const joined = b ? `${b} ${raw}` : raw
  return sentenceCaseFirstCharOnly(joined)
}

export interface TranslatorPageProps {
  token: string | null
  onLogout: () => void
}

export default function TranslatorPage({ token: _token, onLogout }: TranslatorPageProps) {
  void _token
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [conversationText, setConversationText] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [notRecognizedHint, setNotRecognizedHint] = useState<string | null>(null)
  const sendQueueRef = useRef<Promise<void>>(Promise.resolve())

  const handleSegmentReady = useCallback((clip: ClipPayload) => {
    setPendingCount((n) => n + 1)
    sendQueueRef.current = sendQueueRef.current.then(async () => {
      try {
        const response = await recognizeClip(clip)
        switch (response.recognized) {
          case true:
            setNotRecognizedHint(null)
            setConversationText((prev) => appendToConversationBody(prev, response.sign.label))
            speakTranslation(sentenceCaseFirstCharOnly(response.sign.label))
            break
          case false:
            setNotRecognizedHint(response.message ?? 'Expressão não reconhecida.')
            break
        }
        setNetworkError(null)
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            setNetworkError(
              'Nenhuma expressão cadastrada ainda. Acesse Treinar conversa primeiro.',
            )
          } else if (error.response?.status === 503) {
            setNetworkError(
              'Serviço de reconhecimento indisponível. Tente novamente em instantes.',
            )
          } else {
            setNetworkError('Falha ao se conectar com o servidor.')
          }
        } else {
          setNetworkError('Falha ao se conectar com o servidor.')
        }
      } finally {
        setPendingCount((n) => Math.max(0, n - 1))
      }
    })
  }, [])

  const {
    phase,
    handCount,
    errorMessage,
    latestResultRef,
    start,
    stop,
    clearError,
  } = useManualSignRecorder({
    onSegmentReady: handleSegmentReady,
    maxSegmentDurationMs: MAX_SIGN_SEGMENT_DURATION_MS,
  })

  useEffect(() => {
    if (!cameraReady) {
      return
    }
    start(videoRef)
    return () => {
      stop()
    }
  }, [cameraReady, start, stop])

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video
    setCameraReady(true)
  }, [])

  const handleClear = () => {
    setConversationText('')
  }

  const handleSpeak = () => {
    const text = conversationText.trim()
    if (text) {
      speakTranslation(text)
    }
  }

  const hasConversation = Boolean(conversationText.trim())
  const isRecording = phase === 'recording'

  let statusLabel = 'Aguardando câmera…'
  if (cameraReady) {
    if (isRecording) {
      statusLabel = 'Gravando… retire as mãos'
    } else if (handCount === 0) {
      statusLabel = 'Mostre as mãos e faça o sinal.'
    } else {
      statusLabel = 'Afaste as mãos da câmera para enviar.'
    }
  }

  return (
    <>
      <SignFeatureLayout
        fillViewport
        onLogout={onLogout}
        title="Tradutor"
        titleHighlight="de conversa"
        description={
          <>
            O sistema <strong>grava enquanto vê suas mãos</strong>. Ao <strong>retirar as mãos do quadro</strong>, o
            gesto é enviado para reconhecimento e o texto entra na conversa.
          </>
        }
      >
        <Box
          sx={{
            flex: { xs: 'none', md: 1 },
            minHeight: { xs: 'auto', md: 0 },
            display: 'flex',
            flexDirection: 'column',
            overflow: { xs: 'visible', md: 'hidden' },
            gap: { xs: 2, sm: 2 },
          }}
        >
          <Paper sx={{ ...signCardSx, p: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', sm: 'space-between' },
                gap: 1,
              }}
            >
              <Chip
                size="small"
                color={cameraReady ? 'primary' : 'default'}
                variant={cameraReady ? 'filled' : 'outlined'}
                label={statusLabel}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  py: 0.5,
                  '& .MuiChip-label': { whiteSpace: 'normal', fontSize: { xs: '0.8125rem', sm: '0.75rem' } },
                }}
              />
              {pendingCount > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${pendingCount} reconhecendo…`}
                  sx={{ '& .MuiChip-label': { fontSize: { xs: '0.8125rem', sm: '0.75rem' } } }}
                />
              )}
            </Stack>
          </Paper>

          <Box
            sx={{
              flex: { xs: 'none', md: 1 },
              minHeight: { xs: 'auto', md: 0 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
              gridTemplateRows: { xs: 'auto auto', md: 'minmax(0, 1fr)' },
              gap: { xs: 2, sm: 2 },
              alignItems: 'stretch',
              overflow: { xs: 'visible', md: 'hidden' },
            }}
          >
            <SignCameraCard
              cameraReady={cameraReady}
              video={
                <CameraFeed
                  disabled={false}
                  onReady={handleVideoReady}
                  resultRef={latestResultRef}
                  showHandLandmarks={cameraReady && (handCount > 0 || isRecording)}
                  fillHeight
                  showHeadPositionGuide
                />
              }
              footer={
                !cameraReady ? (
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={148}
                    height={32}
                    sx={{ borderRadius: 999 }}
                  />
                ) : (
                  <>
                    <BimanualBadge handCount={handCount} />
                    {isRecording && <Chip size="small" color="primary" variant="outlined" label="Gravando" />}
                  </>
                )
              }
            />

            <Paper
              sx={{
                ...signCardSx,
                p: { xs: 2.25, sm: 2.5 },
                minHeight: { xs: 'auto', md: 0 },
                flex: { md: 1 },
                display: 'flex',
                flexDirection: 'column',
                overflow: { xs: 'visible', md: 'hidden' },
              }}
            >
              <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: -0.35,
                      fontSize: { xs: '1.1875rem', sm: '1.125rem' },
                    }}
                  >
                    Conversa
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Button
                      size="medium"
                      variant="text"
                      color="primary"
                      startIcon={<RecordVoiceOverIcon />}
                      onClick={handleSpeak}
                      disabled={!hasConversation}
                      sx={{ minHeight: 44 }}
                    >
                      Falar
                    </Button>
                    <Button
                      size="medium"
                      variant="text"
                      color="primary"
                      startIcon={<RefreshIcon />}
                      onClick={handleClear}
                      disabled={!hasConversation}
                      sx={{ minHeight: 44 }}
                    >
                      Limpar
                    </Button>
                  </Stack>
                </Stack>
                <Divider />
              </Stack>
              <Box
                sx={{
                  flex: { md: 1 },
                  minHeight: { xs: 'auto', md: 0 },
                  overflowY: { xs: 'visible', md: 'auto' },
                  pt: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={cameraReady ? 5 : 3}
                  maxRows={16}
                  variant="outlined"
                  placeholder={
                    cameraReady
                      ? 'Digite aqui. Expressões reconhecidas entram ao final do texto.'
                      : 'Aguarde a câmera ou digite já.'
                  }
                  value={conversationText}
                  onChange={(e) => setConversationText(e.target.value)}
                  slotProps={{
                    htmlInput: { 'aria-label': 'Texto da conversa' },
                  }}
                  sx={{
                    flex: { md: 1 },
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start',
                      fontSize: { xs: '1.125rem', sm: '1.0625rem' },
                      lineHeight: 1.5,
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </SignFeatureLayout>

      <Snackbar
        open={Boolean(networkError)}
        autoHideDuration={8000}
        onClose={() => setNetworkError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setNetworkError(null)}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {networkError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(notRecognizedHint)}
        autoHideDuration={7000}
        onClose={() => setNotRecognizedHint(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setNotRecognizedHint(null)}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notRecognizedHint}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={7000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={clearError} sx={{ width: '100%', borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
