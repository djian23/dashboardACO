import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin, Ticket, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Event } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EventCardProps {
  event: Event
}

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

export function EventCard({ event }: EventCardProps) {
  const { t, i18n } = useTranslation('events')
  const navigate = useNavigate()
  const totals = getEventTotals(event)

  return (
    <Card
      className="cursor-pointer border-[#2a2a2a] bg-[#1a1a1a] transition-all hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/5"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">{event.name}</h3>
          <div className="flex flex-shrink-0 gap-1.5">
            <Badge className={cn('border text-xs', categoryColorMap[event.category])}>
              {t(`categories.${event.category}`)}
            </Badge>
            <Badge className={cn('border text-xs', statusColorMap[event.status])}>
              {t(`statuses.${event.status}`)}
            </Badge>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {event.event_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(event.event_date, i18n.language)}</span>
            </div>
          )}
          {(event.venue || event.city) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {[event.venue, event.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('card.tickets')}</p>
              <p className="text-sm font-medium">{totals.tickets}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('card.invested')}</p>
            <p className="text-sm font-medium">{formatCurrency(totals.invested)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('card.revenue')}</p>
            <p className="text-sm font-medium">{formatCurrency(totals.revenue)}</p>
          </div>
          <div className="flex items-center gap-2">
            {totals.profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">{t('card.profit')}</p>
              <p className={cn('text-sm font-semibold', totals.profit >= 0 ? 'text-green-500' : 'text-red-500')}>
                {formatCurrency(totals.profit)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
