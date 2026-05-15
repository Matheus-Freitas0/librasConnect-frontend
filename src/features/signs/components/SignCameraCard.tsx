import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { signCardSx } from '../../../components/SignFeatureLayout'

const signCameraCardPaperSx: SxProps<Theme> = {
  ...signCardSx,
  p: { xs: 1, sm: 1.5 },
  flex: { md: 1 },
  display: 'flex',
  flexDirection: 'column',
  overflow: { xs: 'visible', md: 'hidden' },
  minHeight: { md: 0 },
}

const videoStageSx: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
  minHeight: { xs: 'min(78dvh, 680px)', sm: 'min(78dvh, 680px)', md: 0 },
  maxHeight: { xs: 'min(84dvh, 820px)', sm: 'min(84dvh, 820px)', md: 'none' },
  display: 'flex',
  flexDirection: 'column',
  flex: { xs: 'none', sm: 'none', md: 1 },
}

interface SignCameraCardProps {
  cameraReady: boolean
  video: ReactNode
  belowVideo?: ReactNode
  footer: ReactNode
}

export default function SignCameraCard({
  cameraReady,
  video,
  belowVideo,
  footer,
}: SignCameraCardProps) {
  return (
    <Paper sx={signCameraCardPaperSx}>
      <Box sx={videoStageSx}>
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
          {video}
        </Box>
      </Box>
      {belowVideo}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', pt: 1, flexShrink: 0 }}>
        {footer}
      </Stack>
    </Paper>
  )
}
