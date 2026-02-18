import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import type { ParcelStatusEntry } from '@/types'

interface ParcelTimelineProps {
  history: ParcelStatusEntry[]
}

export function ParcelTimeline({ history }: ParcelTimelineProps) {
  const { t } = useTranslation('parcels')

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (sortedHistory.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        {t('noStatusHistory')}
      </p>
    )
  }

  return (
    <div className="relative pl-6 space-y-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#2a2a2a]" />

      {sortedHistory.map((entry, index) => (
        <div key={index} className="relative">
          {/* Dot */}
          <div
            className={`absolute left-[-24px] top-1 h-[18px] w-[18px] rounded-full border-2 ${
              index === 0
                ? 'bg-[#7c3aed] border-[#7c3aed]'
                : 'bg-[#1a1a1a] border-[#2a2a2a]'
            }`}
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {entry.status}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(entry.timestamp)}
              </span>
            </div>

            {entry.location && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{entry.location}</span>
              </div>
            )}

            {entry.description && (
              <p className="text-xs text-gray-500">{entry.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
