import PanToolAltIcon from '@mui/icons-material/PanToolAlt'
import Chip from '@mui/material/Chip'

export interface BimanualBadgeProps {
  handCount: number
}

export default function BimanualBadge({ handCount }: BimanualBadgeProps) {
  let label: string
  let color: 'error' | 'warning' | 'success'

  if (handCount === 0) {
    label = 'Nenhuma mão'
    color = 'error'
  } else if (handCount === 1) {
    label = '1 mão'
    color = 'warning'
  } else {
    label = '2 mãos'
    color = 'success'
  }

  return (
    <Chip
      icon={<PanToolAltIcon />}
      label={label}
      color={color}
      size="small"
      sx={{ fontWeight: 600, borderRadius: 999 }}
    />
  )
}
