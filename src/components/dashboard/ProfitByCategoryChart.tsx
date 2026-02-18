import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f97316', '#ec4899']

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      category: string
      profit: number
      count: number
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 shadow-xl">
      <p className="text-sm text-white font-medium">{data.category}</p>
      <p className="text-xs text-gray-400 mt-1">
        {formatCurrency(data.profit)} ({data.count} items)
      </p>
    </div>
  )
}

export function ProfitByCategoryChart() {
  const { t } = useTranslation('dashboard')
  const { data: stats } = useDashboardStats()

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">
        {t('charts.profit_by_category')}
      </h3>

      {!stats ? (
        <div className="flex items-center justify-center">
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : stats.category_data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-sm text-gray-500">
          {t('charts.no_data')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.category_data}
              dataKey="profit"
              nameKey="category"
              cx="50%"
              cy="45%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={3}
              strokeWidth={0}
            >
              {stats.category_data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 12, color: '#9ca3af' }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
