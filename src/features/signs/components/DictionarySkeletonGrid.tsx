import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import { signCardSx } from '../../../components/SignFeatureLayout'

interface DictionarySkeletonGridProps {
  count?: number
}

export default function DictionarySkeletonGrid({ count = 8 }: DictionarySkeletonGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, sm: 2.5, md: 2 },
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Card
          key={i}
          elevation={0}
          sx={{
            ...signCardSx,
            borderRadius: 2.5,
            overflow: 'hidden',
          }}
        >
          <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', aspectRatio: '16 / 9' }} />
          <Box sx={{ p: 2.5 }}>
            <Skeleton variant="text" width="55%" height={28} animation="wave" />
            <Skeleton variant="text" width="35%" height={4} sx={{ my: 1.5 }} animation="wave" />
            <Skeleton variant="text" width="100%" animation="wave" />
            <Skeleton variant="text" width="88%" animation="wave" />
          </Box>
        </Card>
      ))}
    </Box>
  )
}
