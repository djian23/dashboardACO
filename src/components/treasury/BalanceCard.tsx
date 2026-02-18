import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/20">
            <Wallet className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Solde actuel</p>
        </div>

        <p className="text-4xl font-bold text-white mb-6">
          {formatCurrency(balance)}
        </p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Revenus</p>
              <p className="text-sm font-semibold text-emerald-500">
                +{formatCurrency(income)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Depenses</p>
              <p className="text-sm font-semibold text-red-500">
                -{formatCurrency(expenses)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
