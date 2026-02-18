import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
}

export function KpiCard({ title, value, icon: Icon, trend, trendLabel }: KpiCardProps) {
  const isTrendPositive = trend !== undefined && trend >= 0

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 flex items-start gap-4">
      {/* Icon */}
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#7c3aed]/15 text-[#7c3aed]">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{title}</p>
        <p className="text-xl font-bold text-white mt-0.5 truncate">{value}</p>

        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isTrendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
            )}
            <span
              className={`text-xs font-medium ${
                isTrendPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isTrendPositive ? '+' : ''}
              {trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-gray-500 ml-0.5">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
