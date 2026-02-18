import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, ShoppingCart } from 'lucide-react'
import { useDeleteTicketLot } from '@/hooks/useTicketLots'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { TicketLot } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TicketLotFormModal } from './TicketLotFormModal'
import { SaleFormModal } from './SaleFormModal'

interface TicketLotTableProps {
  lots: TicketLot[]
  eventId: string
}

const ticketTypeColorMap: Record<TicketLot['ticket_type'], string> = {
  mobile: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'e-ticket': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  physical: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

const lotStatusColorMap: Record<TicketLot['status'], string> = {
  in_stock: 'bg-green-500/20 text-green-400 border-green-500/30',
  listed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sold: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  transferred: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const transferStatusColorMap: Record<TicketLot['transfer_status'], string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  transferred: 'bg-green-500/20 text-green-400 border-green-500/30',
  not_needed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export function TicketLotTable({ lots, eventId }: TicketLotTableProps) {
  const { t } = useTranslation('events')
  const deleteTicketLot = useDeleteTicketLot()

  const [lotModalOpen, setLotModalOpen] = useState(false)
  const [editingLot, setEditingLot] = useState<TicketLot | undefined>()
  const [saleModalOpen, setSaleModalOpen] = useState(false)
  const [saleTicketLotId, setSaleTicketLotId] = useState<string | undefined>()

  const handleAddLot = () => {
    setEditingLot(undefined)
    setLotModalOpen(true)
  }

  const handleEditLot = (lot: TicketLot) => {
    setEditingLot(lot)
    setLotModalOpen(true)
  }

  const handleDeleteLot = async (lot: TicketLot) => {
    if (window.confirm(t('ticketLotTable.deleteConfirm'))) {
      await deleteTicketLot.mutateAsync({ id: lot.id, eventId })
    }
  }

  const handleAddSale = (ticketLotId: string) => {
    setSaleTicketLotId(ticketLotId)
    setSaleModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('ticketLotTable.title')}</h3>
          <Button
            onClick={handleAddLot}
            size="sm"
            className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('ticketLotTable.addLot')}
          </Button>
        </div>

        <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                <TableHead>{t('ticketLotTable.section')}</TableHead>
                <TableHead>{t('ticketLotTable.row')}</TableHead>
                <TableHead>{t('ticketLotTable.seats')}</TableHead>
                <TableHead>{t('ticketLotTable.type')}</TableHead>
                <TableHead>{t('ticketLotTable.qty')}</TableHead>
                <TableHead>{t('ticketLotTable.unitPrice')}</TableHead>
                <TableHead>{t('ticketLotTable.total')}</TableHead>
                <TableHead>{t('ticketLotTable.platform')}</TableHead>
                <TableHead>{t('ticketLotTable.transfer')}</TableHead>
                <TableHead>{t('ticketLotTable.status')}</TableHead>
                <TableHead className="text-right">{t('ticketLotTable.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.length === 0 ? (
                <TableRow className="border-[#2a2a2a]">
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    {t('ticketLotTable.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                lots.map((lot) => (
                  <TableRow key={lot.id} className="border-[#2a2a2a] hover:bg-[#2a2a2a]/50">
                    <TableCell className="font-medium">{lot.section ?? '-'}</TableCell>
                    <TableCell>{lot.row ?? '-'}</TableCell>
                    <TableCell>{lot.seat_numbers ?? '-'}</TableCell>
                    <TableCell>
                      <Badge className={cn('border text-xs', ticketTypeColorMap[lot.ticket_type])}>
                        {t(`ticketTypes.${lot.ticket_type === 'e-ticket' ? 'eticket' : lot.ticket_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{lot.quantity}</TableCell>
                    <TableCell>{formatCurrency(lot.purchase_price_unit)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(lot.purchase_price_total)}</TableCell>
                    <TableCell className="text-muted-foreground">{lot.purchase_platform ?? '-'}</TableCell>
                    <TableCell>
                      <Badge className={cn('border text-xs', transferStatusColorMap[lot.transfer_status])}>
                        {t(`transferStatuses.${lot.transfer_status === 'not_needed' ? 'notNeeded' : lot.transfer_status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('border text-xs', lotStatusColorMap[lot.status])}>
                        {t(`lotStatuses.${lot.status === 'in_stock' ? 'inStock' : lot.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-[#7c3aed]"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddSale(lot.id)
                          }}
                          title={t('ticketLotTable.addSale')}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditLot(lot)
                          }}
                          title={t('ticketLotTable.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLot(lot)
                          }}
                          title={t('ticketLotTable.delete')}
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
        </div>
      </div>

      <TicketLotFormModal
        open={lotModalOpen}
        onOpenChange={setLotModalOpen}
        eventId={eventId}
        ticketLot={editingLot}
      />

      <SaleFormModal
        open={saleModalOpen}
        onOpenChange={setSaleModalOpen}
        ticketLotId={saleTicketLotId}
      />
    </>
  )
}
