import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, CreditCard, Repeat, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { BalanceCard } from '@/components/treasury/BalanceCard'
import { CashFlowChart } from '@/components/treasury/CashFlowChart'
import { IncomeExpensesChart } from '@/components/treasury/IncomeExpensesChart'
import { TreasuryEntryFormModal } from '@/components/treasury/TreasuryEntryFormModal'
import { SubscriptionFormModal } from '@/components/treasury/SubscriptionFormModal'
import {
  useTreasuryEntries,
  useTreasuryBalance,
  useDeleteTreasuryEntry,
} from '@/hooks/useTreasury'
import {
  useSubscriptions,
  useDeleteSubscription,
} from '@/hooks/useSubscriptions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TreasuryEntry, Subscription } from '@/types'

export default function TreasuryPage() {
  const { t } = useTranslation('treasury')

  // Filters
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Modals
  const [entryModalOpen, setEntryModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TreasuryEntry | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  // Data
  const { data: balance } = useTreasuryBalance()
  const { data: entries = [] } = useTreasuryEntries({
    type: filterType !== 'all' ? (filterType as 'income' | 'expense') : undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })
  const { data: subscriptions = [] } = useSubscriptions()
  const deleteEntry = useDeleteTreasuryEntry()
  const deleteSubscription = useDeleteSubscription()

  // Compute chart data
  const cashFlowData = useMemo(() => {
    if (!entries.length) return []
    const sorted = [...entries].sort(
      (a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    )
    let cumulative = 0
    return sorted.map((entry) => {
      cumulative += entry.type === 'income' ? entry.amount : -entry.amount
      return { date: entry.entry_date, balance: cumulative }
    })
  }, [entries])

  const incomeExpensesData = useMemo(() => {
    if (!entries.length) return []
    const monthMap: Record<string, { income: number; expenses: number }> = {}
    entries.forEach((entry) => {
      const month = entry.entry_date.slice(0, 7) // YYYY-MM
      if (!monthMap[month]) monthMap[month] = { income: 0, expenses: 0 }
      if (entry.type === 'income') {
        monthMap[month].income += entry.amount
      } else {
        monthMap[month].expenses += entry.amount
      }
    })
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))
  }, [entries])

  // Active subscriptions monthly cost
  const activeSubscriptions = subscriptions.filter((s) => s.is_active)
  const totalMonthlyCost = activeSubscriptions.reduce((sum, sub) => {
    switch (sub.billing_cycle) {
      case 'monthly':
        return sum + sub.amount
      case 'quarterly':
        return sum + sub.amount / 3
      case 'yearly':
        return sum + sub.amount / 12
      default:
        return sum
    }
  }, 0)

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set(entries.map((e) => e.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [entries])

  const handleEditEntry = (entry: TreasuryEntry) => {
    setEditingEntry(entry)
    setEntryModalOpen(true)
  }

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSubscription(sub)
    setSubscriptionModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title', 'Tresorerie')}</h1>
        <Button
          onClick={() => {
            setEditingEntry(null)
            setEntryModalOpen(true)
          }}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addEntry', 'Ajouter une transaction')}
        </Button>
      </div>

      {/* Balance card */}
      <BalanceCard
        balance={balance?.balance ?? 0}
        income={balance?.totalIncome ?? 0}
        expenses={balance?.totalExpenses ?? 0}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart data={cashFlowData} />
        <IncomeExpensesChart data={incomeExpensesData} />
      </div>

      {/* Treasury entries table */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-white text-base">
            {t('entries', 'Transactions')}
          </CardTitle>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all" className="text-white">Tous</SelectItem>
                <SelectItem value="income" className="text-white">Revenus</SelectItem>
                <SelectItem value="expense" className="text-white">Depenses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all" className="text-white">Toutes</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-white">
                    {cat.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Date debut"
              className="w-[160px] bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Date fin"
              className="w-[160px] bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Categorie</TableHead>
                <TableHead className="text-gray-400">Description</TableHead>
                <TableHead className="text-gray-400">Paiement</TableHead>
                <TableHead className="text-gray-400 text-right">Montant</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow className="border-[#2a2a2a]">
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Aucune transaction trouvee
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="border-[#2a2a2a]">
                    <TableCell className="text-gray-300 text-sm">
                      {formatDate(entry.entry_date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          entry.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }
                      >
                        {entry.type === 'income' ? 'Revenu' : 'Depense'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm capitalize">
                      {entry.category?.replace('_', ' ') ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">
                      {entry.description ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm capitalize">
                      {entry.payment_method?.replace('_', ' ') ?? '-'}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-medium ${
                        entry.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                          onClick={() => deleteEntry.mutate(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator className="bg-[#2a2a2a]" />

      {/* Subscriptions section */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-base">
                {t('subscriptions', 'Abonnements')}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Cout mensuel total :{' '}
                <span className="text-[#7c3aed] font-semibold">
                  {formatCurrency(totalMonthlyCost)}
                </span>
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingSubscription(null)
                setSubscriptionModalOpen(true)
              }}
              variant="outline"
              className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addSubscription', 'Ajouter un abonnement')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeSubscriptions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun abonnement actif</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7c3aed]/20">
                        <Repeat className="h-4 w-4 text-[#7c3aed]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{sub.name}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {sub.category ?? 'Non classe'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-white"
                        onClick={() => handleEditSubscription(sub)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => deleteSubscription.mutate(sub.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(sub.amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-[#2a2a2a] text-gray-400 text-xs"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      {sub.billing_cycle === 'monthly'
                        ? 'Mensuel'
                        : sub.billing_cycle === 'quarterly'
                          ? 'Trimestriel'
                          : 'Annuel'}
                    </Badge>
                  </div>

                  {sub.next_billing_date && (
                    <p className="text-xs text-gray-500">
                      Prochaine facturation : {formatDate(sub.next_billing_date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TreasuryEntryFormModal
        open={entryModalOpen}
        onOpenChange={setEntryModalOpen}
        entry={editingEntry}
      />
      <SubscriptionFormModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
        subscription={editingSubscription}
      />
    </div>
  )
}
