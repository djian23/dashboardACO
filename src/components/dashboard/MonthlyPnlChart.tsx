import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyPnlChart() {
  const { t } = useTranslation('dashboard')
  const { data: stats } = useDashboardStats()

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        {t('charts.monthly_pnl')}
      </h3>

      {!stats ? (
        <div className="space-y-3">
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={stats.monthly_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#2a2a2a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat('fr-FR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="revenue"
              name={t('charts.revenue')}
              fill="#7c3aed"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="costs"
              name={t('charts.costs')}
              fill="#4a4a4a"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name={t('charts.profit')}
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
