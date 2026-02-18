import { ShoppingCart, CreditCard, CalendarPlus, PackagePlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  sale: ShoppingCart,
  purchase: CreditCard,
  event_created: CalendarPlus,
  product_added: PackagePlus,
}

const ACTIVITY_COLORS: Record<string, string> = {
  sale: 'text-emerald-400 bg-emerald-400/15',
  purchase: 'text-blue-400 bg-blue-400/15',
  event_created: 'text-[#7c3aed] bg-[#7c3aed]/15',
  product_added: 'text-orange-400 bg-orange-400/15',
}

export function RecentActivityFeed() {
  const { t, i18n } = useTranslation('dashboard')
  const { data: stats } = useDashboardStats()

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        {t('activity.title')}
      </h3>

      {!stats ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : stats.recent_activity.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          {t('activity.empty')}
        </div>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {stats.recent_activity.slice(0, 10).map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? ShoppingCart
            const colorClasses = ACTIVITY_COLORS[activity.type] ?? 'text-gray-400 bg-gray-400/15'

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${colorClasses}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(activity.created_at, i18n.language)}
                  </p>
                </div>

                {/* Amount */}
                {activity.amount !== null && (
                  <span className="flex-shrink-0 text-sm font-medium text-white">
                    {formatCurrency(activity.amount)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
