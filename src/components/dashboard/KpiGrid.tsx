import { DollarSign, TrendingUp, Wallet, Percent, Ticket, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils'

export function KpiGrid() {
  const { t } = useTranslation('dashboard')
  const { data: stats } = useDashboardStats()

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: t('kpi.total_invested'),
      value: formatCurrency(stats.total_invested),
      icon: DollarSign,
    },
    {
      title: t('kpi.total_revenue'),
      value: formatCurrency(stats.total_revenue),
      icon: TrendingUp,
    },
    {
      title: t('kpi.total_profit'),
      value: formatCurrency(stats.total_profit),
      icon: Wallet,
      trend: stats.total_invested > 0 ? stats.roi_percentage : undefined,
    },
    {
      title: t('kpi.roi'),
      value: `${stats.roi_percentage.toFixed(1)}%`,
      icon: Percent,
    },
    {
      title: t('kpi.tickets_in_stock'),
      value: stats.tickets_in_stock.toLocaleString('fr-FR'),
      icon: Ticket,
    },
    {
      title: t('kpi.products_in_stock'),
      value: stats.products_in_stock.toLocaleString('fr-FR'),
      icon: Package,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          trend={kpi.trend}
        />
      ))}
    </div>
  )
}
