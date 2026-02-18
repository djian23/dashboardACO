import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateTicketLot, useUpdateTicketLot } from '@/hooks/useTicketLots'
import { useTmAccounts } from '@/hooks/useTmAccounts'
import { formatCurrency } from '@/lib/utils'
import type { TicketLot } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketLotFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  ticketLot?: TicketLot
}

export function TicketLotFormModal({
  open,
  onOpenChange,
  eventId,
  ticketLot,
}: TicketLotFormModalProps) {
  const { t } = useTranslation('events')
  const createTicketLot = useCreateTicketLot()
  const updateTicketLot = useUpdateTicketLot()
  const { data: tmAccounts } = useTmAccounts()

  const isEdit = !!ticketLot

  const [section, setSection] = useState('')
  const [row, setRow] = useState('')
  const [seatNumbers, setSeatNumbers] = useState('')
  const [ticketType, setTicketType] = useState<TicketLot['ticket_type']>('mobile')
  const [quantity, setQuantity] = useState(1)
  const [purchasePriceUnit, setPurchasePriceUnit] = useState(0)
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasePlatform, setPurchasePlatform] = useState('')
  const [faceValue, setFaceValue] = useState('')
  const [transferStatus, setTransferStatus] = useState<TicketLot['transfer_status']>('pending')
  const [tmAccountId, setTmAccountId] = useState('')
  const [status, setStatus] = useState<TicketLot['status']>('in_stock')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (ticketLot) {
      setSection(ticketLot.section ?? '')
      setRow(ticketLot.row ?? '')
      setSeatNumbers(ticketLot.seat_numbers ?? '')
      setTicketType(ticketLot.ticket_type)
      setQuantity(ticketLot.quantity)
      setPurchasePriceUnit(ticketLot.purchase_price_unit)
      setPurchaseDate(ticketLot.purchase_date?.slice(0, 10) ?? '')
      setPurchasePlatform(ticketLot.purchase_platform ?? '')
      setFaceValue(ticketLot.face_value?.toString() ?? '')
      setTransferStatus(ticketLot.transfer_status)
      setTmAccountId(ticketLot.tm_account_id ?? '')
      setStatus(ticketLot.status)
      setNotes(ticketLot.notes ?? '')
    } else {
      setSection('')
      setRow('')
      setSeatNumbers('')
      setTicketType('mobile')
      setQuantity(1)
      setPurchasePriceUnit(0)
      setPurchaseDate('')
      setPurchasePlatform('')
      setFaceValue('')
      setTransferStatus('pending')
      setTmAccountId('')
      setStatus('in_stock')
      setNotes('')
      setError('')
    }
  }, [ticketLot, open])

  const calculatedTotal = useMemo(() => {
    return quantity * purchasePriceUnit
  }, [quantity, purchasePriceUnit])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const payload: Partial<TicketLot> = {
      event_id: eventId,
      section: section.trim() || null,
      row: row.trim() || null,
      seat_numbers: seatNumbers.trim() || null,
      ticket_type: ticketType,
      quantity,
      purchase_price_unit: purchasePriceUnit,
      purchase_price_total: calculatedTotal,
      purchase_date: purchaseDate || null,
      purchase_platform: purchasePlatform.trim() || null,
      face_value: faceValue ? parseFloat(faceValue) : null,
      transfer_status: transferStatus,
      tm_account_id: tmAccountId || null,
      status,
      notes: notes.trim() || null,
    }

    try {
      if (isEdit && ticketLot) {
        await updateTicketLot.mutateAsync({ id: ticketLot.id, ...payload })
      } else {
        await createTicketLot.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      setError(t('ticketLotForm.error'))
    }
  }

  const isLoading = createTicketLot.isPending || updateTicketLot.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#2a2a2a] bg-[#1a1a1a] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? t('ticketLotForm.editTitle') : t('ticketLotForm.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEdit ? t('ticketLotForm.editDescription') : t('ticketLotForm.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lot-section">{t('ticketLotForm.section')}</Label>
              <Input
                id="lot-section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder={t('ticketLotForm.sectionPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-row">{t('ticketLotForm.row')}</Label>
              <Input
                id="lot-row"
                value={row}
                onChange={(e) => setRow(e.target.value)}
                placeholder={t('ticketLotForm.rowPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-seats">{t('ticketLotForm.seatNumbers')}</Label>
              <Input
                id="lot-seats"
                value={seatNumbers}
                onChange={(e) => setSeatNumbers(e.target.value)}
                placeholder={t('ticketLotForm.seatNumbersPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('ticketLotForm.ticketType')}</Label>
              <Select value={ticketType} onValueChange={(v) => setTicketType(v as TicketLot['ticket_type'])}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="mobile">{t('ticketTypes.mobile')}</SelectItem>
                  <SelectItem value="e-ticket">{t('ticketTypes.eticket')}</SelectItem>
                  <SelectItem value="physical">{t('ticketTypes.physical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-quantity">{t('ticketLotForm.quantity')}</Label>
              <Input
                id="lot-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-price">{t('ticketLotForm.purchasePriceUnit')}</Label>
              <Input
                id="lot-price"
                type="number"
                min={0}
                step={0.01}
                value={purchasePriceUnit}
                onChange={(e) => setPurchasePriceUnit(parseFloat(e.target.value) || 0)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="sm:col-span-2 rounded-md border border-[#2a2a2a] bg-[#0f0f0f] p-3">
              <span className="text-sm text-muted-foreground">{t('ticketLotForm.calculatedTotal')}: </span>
              <span className="text-lg font-semibold text-[#7c3aed]">{formatCurrency(calculatedTotal)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-purchase-date">{t('ticketLotForm.purchaseDate')}</Label>
              <Input
                id="lot-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-platform">{t('ticketLotForm.purchasePlatform')}</Label>
              <Input
                id="lot-platform"
                value={purchasePlatform}
                onChange={(e) => setPurchasePlatform(e.target.value)}
                placeholder={t('ticketLotForm.purchasePlatformPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot-face-value">{t('ticketLotForm.faceValue')}</Label>
              <Input
                id="lot-face-value"
                type="number"
                min={0}
                step={0.01}
                value={faceValue}
                onChange={(e) => setFaceValue(e.target.value)}
                placeholder={t('ticketLotForm.faceValuePlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('ticketLotForm.transferStatus')}</Label>
              <Select value={transferStatus} onValueChange={(v) => setTransferStatus(v as TicketLot['transfer_status'])}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="pending">{t('transferStatuses.pending')}</SelectItem>
                  <SelectItem value="transferred">{t('transferStatuses.transferred')}</SelectItem>
                  <SelectItem value="not_needed">{t('transferStatuses.notNeeded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('ticketLotForm.tmAccount')}</Label>
              <Select value={tmAccountId} onValueChange={setTmAccountId}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue placeholder={t('ticketLotForm.tmAccountPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="none">{t('ticketLotForm.noTmAccount')}</SelectItem>
                  {tmAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.display_name || account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('ticketLotForm.status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TicketLot['status'])}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="in_stock">{t('lotStatuses.inStock')}</SelectItem>
                  <SelectItem value="listed">{t('lotStatuses.listed')}</SelectItem>
                  <SelectItem value="sold">{t('lotStatuses.sold')}</SelectItem>
                  <SelectItem value="transferred">{t('lotStatuses.transferred')}</SelectItem>
                  <SelectItem value="cancelled">{t('lotStatuses.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lot-notes">{t('ticketLotForm.notes')}</Label>
              <Textarea
                id="lot-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('ticketLotForm.notesPlaceholder')}
                rows={2}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a]"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              {isLoading
                ? t('form.saving')
                : isEdit
                  ? t('form.update')
                  : t('form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
