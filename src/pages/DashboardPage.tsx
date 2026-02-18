import { useTranslation } from 'react-i18next'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { MonthlyPnlChart } from '@/components/dashboard/MonthlyPnlChart'
import { ProfitByCategoryChart } from '@/components/dashboard/ProfitByCategoryChart'
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>

      {/* KPI Cards */}
      <KpiGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyPnlChart />
        </div>
        <div className="lg:col-span-1">
          <ProfitByCategoryChart />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed />
    </div>
  )
}
