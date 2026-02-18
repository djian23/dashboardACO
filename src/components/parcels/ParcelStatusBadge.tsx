import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface ParcelStatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  in_transit: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  out_for_delivery: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  exception: 'bg-red-500/20 text-red-400 border-red-500/30',
  returned: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

const statusKeys: Record<string, string> = {
  pending: 'statusPending',
  in_transit: 'statusInTransit',
  out_for_delivery: 'statusOutForDelivery',
  delivered: 'statusDelivered',
  exception: 'statusException',
  returned: 'statusReturned',
}

export function ParcelStatusBadge({ status }: ParcelStatusBadgeProps) {
  const { t } = useTranslation('parcels')
  const style = statusStyles[status] ?? statusStyles.pending
  const labelKey = statusKeys[status] ?? 'statusPending'

  return <Badge className={style}>{t(labelKey)}</Badge>
}
