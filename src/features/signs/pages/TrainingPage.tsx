import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import SignFeatureLayout, { signCardSx } from '../../../components/SignFeatureLayout'
import { submitTrainingSample } from '../api/signsApi'
import { useManualSignRecorder } from '../capture/useManualSignRecorder'
import BimanualBadge from '../components/BimanualBadge'
import CameraFeed from '../components/CameraFeed'
import type { ClipPayload } from '../types'

export interface TrainingPageProps {
  token: string | null
  onLogout: () => void
}

export default function TrainingPage({ token: _token, onLogout }: TrainingPageProps) {
  void _token
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [pendingClip, setPendingClip] = useState<ClipPayload | null>(null)
  const [labelValue, setLabelValue] = useState('')
  const [descriptionValue, setDescriptionValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  const onClipReady = useCallback((clip: ClipPayload) => {
    setPendingClip(clip)
    setLabelDialogOpen(true)
  }, [])

  const {
    phase,
    handCount,
    recordingElapsedMs,
    recordingProgress,
    errorMessage,
    latestResultRef,
    start,
    stop,
    clearError,
  } = useManualSignRecorder({ onSegmentReady: onClipReady })

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

  const handleDiscard = useCallback(() => {
    setPendingClip(null)
    setLabelValue('')
    setDescriptionValue('')
    setSubmitError(null)
  }, [])

  const handleCancelDialog = useCallback(() => {
    if (submitting) {
      return
    }
    setLabelDialogOpen(false)
    handleDiscard()
  }, [handleDiscard, submitting])

  const handleSubmit = async () => {
    if (!pendingClip) {
      return
    }
    const trimmedLabel = labelValue.trim()
    if (trimmedLabel.length < 1) {
      setSubmitError('Informe o texto da expressão.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitTrainingSample({
        ...pendingClip,
        label: trimmedLabel,
        description: descriptionValue.trim() || undefined,
      })
      setSnackbarMessage(`Amostra de "${trimmedLabel}" salva com sucesso.`)
      setSavedCount((n) => n + 1)
      setLabelDialogOpen(false)
      handleDiscard()
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setSubmitError('Amostra inválida. Tente capturar novamente.')
        } else if (error.response?.status === 413) {
          setSubmitError('Payload muito grande.')
        } else {
          setSubmitError('Falha ao se conectar com o servidor.')
        }
      } else {
        setSubmitError('Falha ao se conectar com o servidor.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isRecording = phase === 'recording'

  let statusBody = 'Aguardando câmera…'
  if (cameraReady) {
    if (isRecording) {
      statusBody = `Gravando… retire as mãos (${(recordingElapsedMs / 1000).toFixed(1)}s)`
    } else if (handCount === 0) {
      statusBody = 'Mostre as mãos e faça o sinal.'
    } else {
      statusBody = 'Afaste as mãos da câmera para concluir a amostra.'
    }
  }

  const dialogPaperSx = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: (theme: Theme) =>
      theme.palette.mode === 'light'
        ? '0 24px 48px -12px rgba(14, 25, 45, 0.12)'
        : '0 24px 48px -12px rgba(0, 0, 0, 0.45)',
  }

  return (
    <>
      <SignFeatureLayout
        fillViewport
        onLogout={onLogout}
        title="Treinar"
        titleHighlight="conversa"
        description={
          <>
            Faça o gesto com as mãos na câmera; ao <strong>retirar as mãos</strong>, a gravação é fechada e você informa o texto
            da expressão. Use sempre o mesmo rótulo para a mesma expressão em LIBRAS.
          </>
        }
      >
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
          <Paper
            sx={{
              ...signCardSx,
              p: { xs: 1, sm: 1.5 },
              minHeight: { xs: 'min(60dvh, 520px)', md: 0 },
              flex: { md: 1 },
              display: 'flex',
              flexDirection: 'column',
              overflow: { xs: 'visible', md: 'hidden' },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                flex: { xs: 1, md: 1 },
                minHeight: { xs: 'min(56dvh, 480px)', md: 0 },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {!cameraReady && (
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                  }}
                />
              )}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: cameraReady ? 1 : 0,
                  transition: 'opacity 200ms ease-out',
                }}
              >
                <CameraFeed
                  disabled={false}
                  onReady={handleVideoReady}
                  resultRef={latestResultRef}
                  showHandLandmarks={cameraReady}
                  fillHeight
                  showHeadPositionGuide
                />
              </Box>
              {isRecording && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                />
              )}
            </Box>

            {isRecording && (
              <LinearProgress
                variant="determinate"
                value={recordingProgress * 100}
                color="primary"
                sx={{ borderRadius: 2, height: 5, mt: 1, flexShrink: 0 }}
              />
            )}

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', pt: 1, flexShrink: 0 }}>
              {!cameraReady ? (
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
                  {isRecording && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {(recordingElapsedMs / 1000).toFixed(1)}s
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          </Paper>

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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: -0.35,
                fontSize: { xs: '1.1875rem', sm: '1.125rem' },
                flexShrink: 0,
              }}
            >
              Status
            </Typography>
            <Box
              sx={{
                flex: { md: 1 },
                minHeight: { xs: 'auto', md: 0 },
                overflowY: { xs: 'visible', md: 'auto' },
                pt: 1.5,
              }}
            >
              {!cameraReady ? (
                <Stack spacing={1.5}>
                  <Skeleton variant="text" width="92%" height={30} animation="wave" />
                  <Skeleton variant="text" width="70%" height={30} animation="wave" />
                  <Skeleton variant="rounded" height={80} animation="wave" sx={{ borderRadius: 2 }} />
                  <Skeleton variant="text" width="55%" height={24} animation="wave" />
                </Stack>
              ) : (
                <>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.65,
                      color: 'text.primary',
                      mb: 1.5,
                      fontSize: { xs: '1.0625rem', sm: '1rem' },
                    }}
                  >
                    {statusBody}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: { xs: '1rem', sm: '0.875rem' } }}
                  >
                    Amostras enviadas nesta sessão: <strong>{savedCount}</strong>
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1rem', sm: '0.875rem' } }}
                  >
                    Dicas
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="ul"
                    sx={{
                      pl: 2.25,
                      m: 0,
                      lineHeight: 1.65,
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                    }}
                  >
                    <li>Prefira poucas expressões bem definidas a muitas parecidas entre si.</li>
                    <li>Use iluminação frontal e mantenha as mãos visíveis durante o gesto.</li>
                    <li>Retire as mãos do quadro ao terminar — é isso que envia o clip.</li>
                  </Typography>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </SignFeatureLayout>

      <Dialog
        open={labelDialogOpen}
        onClose={handleCancelDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: dialogPaperSx,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: -0.35, pb: 1 }}>
          Qual expressão é esse sinal?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, lineHeight: 1.65 }}>
            Esse texto é o que aparecerá no tradutor quando o sistema reconhecer o gesto. Use sempre o mesmo rótulo para a
            mesma expressão em LIBRAS.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              required
              label="Expressão (texto)"
              placeholder="Ex.: Oi, Tchau, Tudo bem, Sim"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              disabled={submitting}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: { xs: 56, md: 60 } } }}
              slotProps={{ htmlInput: { maxLength: 60 } }}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Descrição (opcional)"
              placeholder="Detalhes da pose, mão dominante…"
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              disabled={submitting}
              slotProps={{ htmlInput: { maxLength: 280 } }}
            />
            {submitError && (
              <Alert severity="error" role="alert" sx={{ borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1, flexWrap: 'wrap' }}>
          <Button
            onClick={handleCancelDialog}
            disabled={submitting}
            startIcon={<RefreshIcon />}
            sx={{ minHeight: 48 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || labelValue.trim().length < 1}
            sx={{
              minHeight: 48,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.25, md: 1.5 },
            }}
          >
            {submitting ? 'Enviando…' : 'Salvar amostra'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

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
