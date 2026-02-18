import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Package, ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Parcel } from '@/types'
import { useParcels, useDeleteParcel } from '@/hooks/useParcels'
import { ParcelFormModal } from '@/components/parcels/ParcelFormModal'
import { ParcelStatusBadge } from '@/components/parcels/ParcelStatusBadge'
import { ParcelTimeline } from '@/components/parcels/ParcelTimeline'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

export default function ParcelsPage() {
  const { t } = useTranslation('parcels')

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingParcel, setEditingParcel] = useState<Parcel | undefined>()
  const [deletingParcel, setDeletingParcel] = useState<Parcel | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined
  const { data: parcels, isLoading } = useParcels(filters)
  const deleteParcel = useDeleteParcel()

  const handleEdit = (parcel: Parcel) => {
    setEditingParcel(parcel)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingParcel(undefined)
  }

  const confirmDelete = async () => {
    if (deletingParcel) {
      await deleteParcel.mutateAsync(deletingParcel.id)
      setDeletingParcel(null)
    }
  }

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addParcel')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-[#1a1a1a] border-[#2a2a2a] text-white">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="pending">{t('statusPending')}</SelectItem>
            <SelectItem value="in_transit">{t('statusInTransit')}</SelectItem>
            <SelectItem value="out_for_delivery">
              {t('statusOutForDelivery')}
            </SelectItem>
            <SelectItem value="delivered">{t('statusDelivered')}</SelectItem>
            <SelectItem value="exception">{t('statusException')}</SelectItem>
            <SelectItem value="returned">{t('statusReturned')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && parcels && parcels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-16 w-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {t('emptyTitle')}
          </h2>
          <p className="text-gray-400 mb-6 max-w-md">
            {t('emptyDescription')}
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addFirstParcel')}
          </Button>
        </div>
      )}

      {/* Parcels table */}
      {!isLoading && parcels && parcels.length > 0 && (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                <TableHead className="text-gray-400 w-8" />
                <TableHead className="text-gray-400">
                  {t('trackingNumber')}
                </TableHead>
                <TableHead className="text-gray-400">{t('carrier')}</TableHead>
                <TableHead className="text-gray-400">
                  {t('recipientName')}
                </TableHead>
                <TableHead className="text-gray-400">
                  {t('destination')}
                </TableHead>
                <TableHead className="text-gray-400">{t('status')}</TableHead>
                <TableHead className="text-gray-400">
                  {t('lastUpdate')}
                </TableHead>
                <TableHead className="text-gray-400 text-right">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcels.map((parcel) => (
                <>
                  <TableRow
                    key={parcel.id}
                    className="border-[#2a2a2a] cursor-pointer hover:bg-[#222222]"
                    onClick={() => toggleRow(parcel.id)}
                  >
                    <TableCell className="text-gray-400">
                      {expandedRow === parcel.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="text-white font-mono text-sm">
                      {parcel.tracking_number}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {parcel.carrier ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {parcel.recipient_name ?? '-'}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {parcel.destination ?? '-'}
                    </TableCell>
                    <TableCell>
                      <ParcelStatusBadge status={parcel.status} />
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {formatDate(parcel.last_status_update)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(parcel)}
                          className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingParcel(parcel)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded timeline row */}
                  {expandedRow === parcel.id && (
                    <TableRow
                      key={`${parcel.id}-timeline`}
                      className="border-[#2a2a2a] hover:bg-transparent"
                    >
                      <TableCell colSpan={8} className="bg-[#151515] p-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-4">
                          {t('statusHistory')}
                        </h4>
                        <ParcelTimeline
                          history={parcel.status_history ?? []}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form modal */}
      <ParcelFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        parcel={editingParcel}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingParcel}
        onOpenChange={(open) => !open && setDeletingParcel(null)}
      >
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('confirmDeleteDescription', {
                tracking: deletingParcel?.tracking_number,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingParcel(null)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteParcel.isPending}
            >
              {deleteParcel.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
