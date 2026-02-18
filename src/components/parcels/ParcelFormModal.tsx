import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Parcel } from '@/types'
import { useCreateParcel, useUpdateParcel, detectCarrier } from '@/hooks/useParcels'
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

interface ParcelFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcel?: Parcel
}

export function ParcelFormModal({
  open,
  onOpenChange,
  parcel,
}: ParcelFormModalProps) {
  const { t } = useTranslation('parcels')
  const createParcel = useCreateParcel()
  const updateParcel = useUpdateParcel()

  const [formData, setFormData] = useState({
    tracking_number: '',
    carrier: '',
    recipient_name: '',
    destination: '',
    status: 'pending' as Parcel['status'],
    linked_sale_id: '',
    notes: '',
  })

  useEffect(() => {
    if (parcel) {
      setFormData({
        tracking_number: parcel.tracking_number,
        carrier: parcel.carrier ?? '',
        recipient_name: parcel.recipient_name ?? '',
        destination: parcel.destination ?? '',
        status: parcel.status,
        linked_sale_id: parcel.linked_sale_id ?? '',
        notes: parcel.notes ?? '',
      })
    } else {
      setFormData({
        tracking_number: '',
        carrier: '',
        recipient_name: '',
        destination: '',
        status: 'pending',
        linked_sale_id: '',
        notes: '',
      })
    }
  }, [parcel, open])

  const handleTrackingNumberChange = (value: string) => {
    const detectedCarrier = detectCarrier(value)
    setFormData((prev) => ({
      ...prev,
      tracking_number: value,
      carrier: detectedCarrier,
    }))
  }

  const isEditing = !!parcel

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      tracking_number: formData.tracking_number,
      carrier: formData.carrier || null,
      recipient_name: formData.recipient_name || null,
      destination: formData.destination || null,
      status: formData.status,
      linked_sale_id: formData.linked_sale_id || null,
      notes: formData.notes || null,
    }

    if (isEditing) {
      await updateParcel.mutateAsync({ id: parcel.id, ...payload })
    } else {
      await createParcel.mutateAsync(payload)
    }

    onOpenChange(false)
  }

  const isPending = createParcel.isPending || updateParcel.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? t('editParcel') : t('addParcel')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? t('editParcelDescription')
              : t('addParcelDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking_number" className="text-gray-300">
              {t('trackingNumber')}
            </Label>
            <Input
              id="tracking_number"
              required
              value={formData.tracking_number}
              onChange={(e) => handleTrackingNumberChange(e.target.value)}
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder="XX123456789FR"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier" className="text-gray-300">
              {t('carrier')}
              <span className="text-gray-500 ml-2 text-xs font-normal">
                ({t('autoDetected')})
              </span>
            </Label>
            <Input
              id="carrier"
              value={formData.carrier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, carrier: e.target.value }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient_name" className="text-gray-300">
              {t('recipientName')}
            </Label>
            <Input
              id="recipient_name"
              value={formData.recipient_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recipient_name: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-gray-300">
              {t('destination')}
            </Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  destination: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">
              {t('status')}
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: Parcel['status']) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="pending">{t('statusPending')}</SelectItem>
                <SelectItem value="in_transit">
                  {t('statusInTransit')}
                </SelectItem>
                <SelectItem value="out_for_delivery">
                  {t('statusOutForDelivery')}
                </SelectItem>
                <SelectItem value="delivered">
                  {t('statusDelivered')}
                </SelectItem>
                <SelectItem value="exception">
                  {t('statusException')}
                </SelectItem>
                <SelectItem value="returned">
                  {t('statusReturned')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linked_sale_id" className="text-gray-300">
              {t('linkedSaleId')}
            </Label>
            <Input
              id="linked_sale_id"
              value={formData.linked_sale_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  linked_sale_id: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder={t('linkedSaleIdPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">
              {t('notes')}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              {isPending
                ? t('saving')
                : isEditing
                  ? t('save')
                  : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
