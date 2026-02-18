import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateSale } from '@/hooks/useSales'
import { formatCurrency } from '@/lib/utils'
import type { Sale } from '@/types'
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

interface SaleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketLotId?: string
  productId?: string
}

export function SaleFormModal({
  open,
  onOpenChange,
  ticketLotId,
  productId,
}: SaleFormModalProps) {
  const { t } = useTranslation('events')
  const createSale = useCreateSale()

  const [salePlatform, setSalePlatform] = useState('')
  const [quantitySold, setQuantitySold] = useState(1)
  const [salePriceUnit, setSalePriceUnit] = useState(0)
  const [fees, setFees] = useState(0)
  const [shippingCost, setShippingCost] = useState(0)
  const [saleDate, setSaleDate] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setSalePlatform('')
      setQuantitySold(1)
      setSalePriceUnit(0)
      setFees(0)
      setShippingCost(0)
      setSaleDate(new Date().toISOString().slice(0, 10))
      setBuyerName('')
      setBuyerEmail('')
      setTrackingNumber('')
      setNotes('')
      setError('')
    }
  }, [open])

  const calculatedTotal = useMemo(() => {
    return quantitySold * salePriceUnit
  }, [quantitySold, salePriceUnit])

  const netProfit = useMemo(() => {
    return calculatedTotal - fees - shippingCost
  }, [calculatedTotal, fees, shippingCost])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const payload: Partial<Sale> = {
      ticket_lot_id: ticketLotId || null,
      product_id: productId || null,
      sale_platform: salePlatform.trim() || null,
      quantity_sold: quantitySold,
      sale_price_unit: salePriceUnit,
      sale_price_total: calculatedTotal,
      fees,
      shipping_cost: shippingCost,
      sale_date: saleDate || new Date().toISOString().slice(0, 10),
      buyer_name: buyerName.trim() || null,
      buyer_email: buyerEmail.trim() || null,
      tracking_number: trackingNumber.trim() || null,
      status: 'completed',
      notes: notes.trim() || null,
    }

    try {
      await createSale.mutateAsync(payload)
      onOpenChange(false)
    } catch {
      setError(t('saleForm.error'))
    }
  }

  const isLoading = createSale.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#2a2a2a] bg-[#1a1a1a] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('saleForm.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('saleForm.description')}
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
              <Label htmlFor="sale-platform">{t('saleForm.salePlatform')}</Label>
              <Input
                id="sale-platform"
                value={salePlatform}
                onChange={(e) => setSalePlatform(e.target.value)}
                placeholder={t('saleForm.salePlatformPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-date">{t('saleForm.saleDate')}</Label>
              <Input
                id="sale-date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-quantity">{t('saleForm.quantitySold')}</Label>
              <Input
                id="sale-quantity"
                type="number"
                min={1}
                value={quantitySold}
                onChange={(e) => setQuantitySold(parseInt(e.target.value) || 1)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-price">{t('saleForm.salePriceUnit')}</Label>
              <Input
                id="sale-price"
                type="number"
                min={0}
                step={0.01}
                value={salePriceUnit}
                onChange={(e) => setSalePriceUnit(parseFloat(e.target.value) || 0)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-fees">{t('saleForm.fees')}</Label>
              <Input
                id="sale-fees"
                type="number"
                min={0}
                step={0.01}
                value={fees}
                onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-shipping">{t('saleForm.shippingCost')}</Label>
              <Input
                id="sale-shipping"
                type="number"
                min={0}
                step={0.01}
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="sm:col-span-2 rounded-md border border-[#2a2a2a] bg-[#0f0f0f] p-3 flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">{t('saleForm.total')}: </span>
                <span className="text-lg font-semibold">{formatCurrency(calculatedTotal)}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('saleForm.netProfit')}: </span>
                <span className={`text-lg font-semibold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-buyer-name">{t('saleForm.buyerName')}</Label>
              <Input
                id="sale-buyer-name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={t('saleForm.buyerNamePlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale-buyer-email">{t('saleForm.buyerEmail')}</Label>
              <Input
                id="sale-buyer-email"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder={t('saleForm.buyerEmailPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sale-tracking">{t('saleForm.trackingNumber')}</Label>
              <Input
                id="sale-tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('saleForm.trackingNumberPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sale-notes">{t('saleForm.notes')}</Label>
              <Textarea
                id="sale-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('saleForm.notesPlaceholder')}
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
              {isLoading ? t('form.saving') : t('saleForm.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
