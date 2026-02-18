import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Event } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface EventListProps {
  events: Event[]
}

type SortField = 'name' | 'event_date' | 'venue' | 'city' | 'category' | 'status' | 'tickets' | 'invested' | 'revenue' | 'profit'
type SortDirection = 'asc' | 'desc'

const statusColorMap: Record<Event['status'], string> = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ongoing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const categoryColorMap: Record<Event['category'], string> = {
  concert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  football: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  tennis: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  rugby: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

function getEventTotals(event: Event) {
  const ticketLots = event.ticket_lots ?? []
  const sales = event.sales ?? []

  const tickets = ticketLots.reduce((sum, lot) => sum + (lot.quantity ?? 0), 0)
  const invested = ticketLots.reduce((sum, lot) => sum + (lot.purchase_price_total ?? 0), 0)
  const revenue = sales.reduce((sum, sale) => sum + (sale.sale_price_total ?? 0), 0)
  const totalFees = sales.reduce((sum, sale) => sum + ((sale.fees ?? 0)), 0)
  const profit = revenue - totalFees - invested

  return { tickets, invested, revenue, profit }
}

export function EventList({ events }: EventListProps) {
  const { t, i18n } = useTranslation('events')
  const navigate = useNavigate()

  const [sortField, setSortField] = useState<SortField>('event_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      const totalsA = getEventTotals(a)
      const totalsB = getEventTotals(b)

      switch (sortField) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'event_date':
          return dir * ((a.event_date ?? '').localeCompare(b.event_date ?? ''))
        case 'venue':
          return dir * ((a.venue ?? '').localeCompare(b.venue ?? ''))
        case 'city':
          return dir * ((a.city ?? '').localeCompare(b.city ?? ''))
        case 'category':
          return dir * a.category.localeCompare(b.category)
        case 'status':
          return dir * a.status.localeCompare(b.status)
        case 'tickets':
          return dir * (totalsA.tickets - totalsB.tickets)
        case 'invested':
          return dir * (totalsA.invested - totalsB.invested)
        case 'revenue':
          return dir * (totalsA.revenue - totalsB.revenue)
        case 'profit':
          return dir * (totalsA.profit - totalsB.profit)
        default:
          return 0
      }
    })
  }, [events, sortField, sortDirection])

  const SortableHead = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          'h-3 w-3',
          sortField === field ? 'text-[#7c3aed]' : 'text-muted-foreground/50'
        )} />
      </div>
    </TableHead>
  )

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] hover:bg-transparent">
            <SortableHead field="name">{t('table.name')}</SortableHead>
            <SortableHead field="event_date">{t('table.date')}</SortableHead>
            <SortableHead field="venue">{t('table.venue')}</SortableHead>
            <SortableHead field="city">{t('table.city')}</SortableHead>
            <SortableHead field="category">{t('table.category')}</SortableHead>
            <SortableHead field="status">{t('table.status')}</SortableHead>
            <SortableHead field="tickets">{t('table.tickets')}</SortableHead>
            <SortableHead field="invested">{t('table.invested')}</SortableHead>
            <SortableHead field="revenue">{t('table.revenue')}</SortableHead>
            <SortableHead field="profit">{t('table.profit')}</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEvents.map((event) => {
            const totals = getEventTotals(event)
            return (
              <TableRow
                key={event.id}
                className="cursor-pointer border-[#2a2a2a] hover:bg-[#2a2a2a]/50"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {event.event_date ? formatDate(event.event_date, i18n.language) : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">{event.venue ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{event.city ?? '-'}</TableCell>
                <TableCell>
                  <Badge className={cn('border', categoryColorMap[event.category])}>
                    {t(`categories.${event.category}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn('border', statusColorMap[event.status])}>
                    {t(`statuses.${event.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{totals.tickets}</TableCell>
                <TableCell className="text-muted-foreground">{formatCurrency(totals.invested)}</TableCell>
                <TableCell>{formatCurrency(totals.revenue)}</TableCell>
                <TableCell className={totals.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(totals.profit)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
