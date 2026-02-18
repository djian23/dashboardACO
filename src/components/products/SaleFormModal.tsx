import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useCreateSale } from '@/hooks/useSales'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

interface SaleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
}

const SALE_STATUSES = ['pending', 'completed', 'refunded', 'disputed'] as const

export function SaleFormModal({ open, onOpenChange, productId }: SaleFormModalProps) {
  const { t } = useTranslation('products')
  const createSale = useCreateSale()

  const [formData, setFormData] = useState({
    sale_platform: '',
    quantity_sold: '1',
    sale_price_unit: '',
    fees: '0',
    shipping_cost: '0',
    sale_date: new Date().toISOString().split('T')[0],
    buyer_name: '',
    buyer_email: '',
    tracking_number: '',
    status: 'pending' as (typeof SALE_STATUSES)[number],
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantity = parseInt(formData.quantity_sold, 10) || 1
    const priceUnit = parseFloat(formData.sale_price_unit) || 0

    try {
      await createSale.mutateAsync({
        product_id: productId,
        sale_platform: formData.sale_platform || null,
        quantity_sold: quantity,
        sale_price_unit: priceUnit,
        sale_price_total: quantity * priceUnit,
        fees: parseFloat(formData.fees) || 0,
        shipping_cost: parseFloat(formData.shipping_cost) || 0,
        sale_date: formData.sale_date,
        buyer_name: formData.buyer_name || null,
        buyer_email: formData.buyer_email || null,
        tracking_number: formData.tracking_number || null,
        status: formData.status,
        notes: formData.notes || null,
      })
      onOpenChange(false)
      setFormData({
        sale_platform: '',
        quantity_sold: '1',
        sale_price_unit: '',
        fees: '0',
        shipping_cost: '0',
        sale_date: new Date().toISOString().split('T')[0],
        buyer_name: '',
        buyer_email: '',
        tracking_number: '',
        status: 'pending',
        notes: '',
      })
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-[#2a2a2a] bg-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle>{t('saleForm.title')}</DialogTitle>
          <DialogDescription>{t('saleForm.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sale_platform">{t('saleForm.platform')}</Label>
              <Input
                id="sale_platform"
                value={formData.sale_platform}
                onChange={(e) => setFormData({ ...formData, sale_platform: e.target.value })}
                placeholder={t('saleForm.platformPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sale_date">{t('saleForm.date')}</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
                required
              />
            </div>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity_sold">{t('saleForm.quantity')}</Label>
              <Input
                id="quantity_sold"
                type="number"
                min="1"
                value={formData.quantity_sold}
                onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sale_price_unit">{t('saleForm.unitPrice')}</Label>
              <Input
                id="sale_price_unit"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price_unit}
                onChange={(e) => setFormData({ ...formData, sale_price_unit: e.target.value })}
                placeholder="0.00"
                className="border-[#2a2a2a] bg-[#0f0f0f]"
                required
              />
            </div>
          </div>

          {/* Fees & Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fees">{t('saleForm.fees')}</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                min="0"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shipping_cost">{t('saleForm.shippingCost')}</Label>
              <Input
                id="shipping_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
          </div>

          {/* Buyer info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="buyer_name">{t('saleForm.buyerName')}</Label>
              <Input
                id="buyer_name"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                placeholder={t('saleForm.buyerNamePlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buyer_email">{t('saleForm.buyerEmail')}</Label>
              <Input
                id="buyer_email"
                type="email"
                value={formData.buyer_email}
                onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
          </div>

          {/* Tracking & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tracking_number">{t('saleForm.trackingNumber')}</Label>
              <Input
                id="tracking_number"
                value={formData.tracking_number}
                onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('saleForm.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as (typeof SALE_STATUSES)[number] })
                }
              >
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  {SALE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`saleStatuses.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="sale_notes">{t('saleForm.notes')}</Label>
            <Textarea
              id="sale_notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('saleForm.notesPlaceholder')}
              className="border-[#2a2a2a] bg-[#0f0f0f]"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] hover:bg-[#2a2a2a]"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!formData.sale_price_unit || createSale.isPending}
              className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              {createSale.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saleForm.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
