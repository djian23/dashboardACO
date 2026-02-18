import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  Ticket,
  Percent,
} from 'lucide-react'
import { useEvent, useDeleteEvent } from '@/hooks/useEvents'
import { useTicketLots } from '@/hooks/useTicketLots'
import { formatCurrency, formatDate, calculateROI, cn } from '@/lib/utils'
import type { Event, Sale } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { EventFormModal } from '@/components/events/EventFormModal'
import { TicketLotTable } from '@/components/events/TicketLotTable'

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

export default function EventDetailPage() {
  const { t, i18n } = useTranslation('events')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deleteEvent = useDeleteEvent()

  const { data: event, isLoading } = useEvent(id ?? '')
  const { data: ticketLots } = useTicketLots(id ?? '')

  const [editModalOpen, setEditModalOpen] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{t('detail.notFound')}</h2>
          <Button
            variant="outline"
            onClick={() => navigate('/events')}
            className="mt-4 border-[#2a2a2a]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('detail.backToEvents')}
          </Button>
        </div>
      </div>
    )
  }

  const lots = ticketLots ?? event.ticket_lots ?? []
  const allSales: Sale[] = lots.flatMap((lot) => lot.sales ?? [])

  const totalInvested = lots.reduce((sum, lot) => sum + (lot.purchase_price_total ?? 0), 0)
  const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.sale_price_total ?? 0), 0)
  const totalFees = allSales.reduce((sum, sale) => sum + (sale.fees ?? 0), 0)
  const totalProfit = totalRevenue - totalFees - totalInvested
  const roi = calculateROI(totalInvested, totalRevenue - totalFees)
  const totalTickets = lots.reduce((sum, lot) => sum + (lot.quantity ?? 0), 0)

  const handleDelete = async () => {
    if (window.confirm(t('detail.deleteConfirm'))) {
      await deleteEvent.mutateAsync(event.id)
      navigate('/events')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('detail.backToEvents')}
        </Button>

        {/* Event header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <Badge className={cn('border', categoryColorMap[event.category])}>
                {t(`categories.${event.category}`)}
              </Badge>
              <Badge className={cn('border', statusColorMap[event.status])}>
                {t(`statuses.${event.status}`)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {event.event_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.event_date, i18n.language)}
                  {event.event_end_date && ` - ${formatDate(event.event_end_date, i18n.language)}`}
                </span>
              )}
              {(event.venue || event.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {[event.venue, event.city, event.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>

            {event.description && (
              <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(true)}
              className="border-[#2a2a2a]"
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t('detail.edit')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('detail.delete')}
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title={t('detail.totalInvested')}
            value={formatCurrency(totalInvested)}
            icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            subtitle={`${totalTickets} ${t('detail.tickets')}`}
          />
          <SummaryCard
            title={t('detail.totalRevenue')}
            value={formatCurrency(totalRevenue)}
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            subtitle={`${allSales.length} ${t('detail.sales')}`}
          />
          <SummaryCard
            title={t('detail.profit')}
            value={formatCurrency(totalProfit)}
            icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
            valueColor={totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}
          />
          <SummaryCard
            title={t('detail.roi')}
            value={`${roi.toFixed(1)}%`}
            icon={<Percent className="h-5 w-5 text-muted-foreground" />}
            valueColor={roi >= 0 ? 'text-green-500' : 'text-red-500'}
          />
        </div>

        <Separator className="bg-[#2a2a2a]" />

        {/* Ticket lots table */}
        <TicketLotTable lots={lots} eventId={event.id} />

        <Separator className="bg-[#2a2a2a]" />

        {/* Sales history */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('detail.salesHistory')}</h3>

          {allSales.length === 0 ? (
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center text-muted-foreground">
              {t('detail.noSales')}
            </div>
          ) : (
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead>{t('detail.saleDate')}</TableHead>
                    <TableHead>{t('detail.salePlatform')}</TableHead>
                    <TableHead>{t('detail.saleQty')}</TableHead>
                    <TableHead>{t('detail.saleUnitPrice')}</TableHead>
                    <TableHead>{t('detail.saleTotal')}</TableHead>
                    <TableHead>{t('detail.saleFees')}</TableHead>
                    <TableHead>{t('detail.saleBuyer')}</TableHead>
                    <TableHead>{t('detail.saleStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allSales.map((sale) => (
                    <TableRow key={sale.id} className="border-[#2a2a2a] hover:bg-[#2a2a2a]/50">
                      <TableCell>{formatDate(sale.sale_date, i18n.language)}</TableCell>
                      <TableCell className="text-muted-foreground">{sale.sale_platform ?? '-'}</TableCell>
                      <TableCell>{sale.quantity_sold}</TableCell>
                      <TableCell>{formatCurrency(sale.sale_price_unit)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(sale.sale_price_total)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(sale.fees)}</TableCell>
                      <TableCell className="text-muted-foreground">{sale.buyer_name ?? '-'}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'border text-xs',
                            sale.status === 'completed' && 'bg-green-500/20 text-green-400 border-green-500/30',
                            sale.status === 'pending' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                            sale.status === 'refunded' && 'bg-red-500/20 text-red-400 border-red-500/30',
                            sale.status === 'disputed' && 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          )}
                        >
                          {t(`saleStatuses.${sale.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Notes section */}
        {event.notes && (
          <>
            <Separator className="bg-[#2a2a2a]" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('detail.notes')}</h3>
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-sm text-muted-foreground">
                {event.notes}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      <EventFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        event={event}
      />
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  subtitle,
  valueColor,
}: {
  title: string
  value: string
  icon: React.ReactNode
  subtitle?: string
  valueColor?: string
}) {
  return (
    <Card className="border-[#2a2a2a] bg-[#1a1a1a]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueColor)}>{value}</div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-9 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
