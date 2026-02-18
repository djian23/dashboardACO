import { useState, useEffect, useMemo } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils'
import type { Invoice, InvoiceItem } from '@/types'

interface InvoiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice | null
}

const emptyItem: InvoiceItem = {
  description: '',
  quantity: 1,
  unit_price: 0,
  total: 0,
}

export function InvoiceFormModal({
  open,
  onOpenChange,
  invoice,
}: InvoiceFormModalProps) {
  const isEditing = !!invoice

  const [buyerName, setBuyerName] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [taxRate, setTaxRate] = useState('20')
  const [status, setStatus] = useState<Invoice['status']>('draft')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }])

  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  useEffect(() => {
    if (invoice) {
      setBuyerName(invoice.buyer_name ?? '')
      setBuyerAddress(invoice.buyer_address ?? '')
      setBuyerEmail(invoice.buyer_email ?? '')
      setIssueDate(invoice.issue_date)
      setDueDate(invoice.due_date ?? '')
      setTaxRate(String(invoice.tax_rate ?? 20))
      setStatus(invoice.status)
      setNotes(invoice.notes ?? '')
      setItems(
        invoice.items.length > 0
          ? invoice.items
          : [{ ...emptyItem }]
      )
    } else {
      setBuyerName('')
      setBuyerAddress('')
      setBuyerEmail('')
      setIssueDate(new Date().toISOString().split('T')[0])
      setDueDate('')
      setTaxRate('20')
      setStatus('draft')
      setNotes('')
      setItems([{ ...emptyItem }])
    }
  }, [invoice, open])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [items]
  )

  const taxAmount = useMemo(
    () => subtotal * (parseFloat(taxRate) / 100),
    [subtotal, taxRate]
  )

  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount])

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index] }

      if (field === 'description') {
        item.description = value as string
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0
      } else if (field === 'unit_price') {
        item.unit_price = Number(value) || 0
      }

      item.total = item.quantity * item.unit_price
      updated[index] = item
      return updated
    })
  }

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalItems = items.map((item) => ({
      ...item,
      total: item.quantity * item.unit_price,
    }))

    const data = {
      buyer_name: buyerName || null,
      buyer_address: buyerAddress || null,
      buyer_email: buyerEmail || null,
      issue_date: issueDate,
      due_date: dueDate || null,
      tax_rate: parseFloat(taxRate),
      tax_amount: taxAmount,
      subtotal,
      total,
      status,
      notes: notes || null,
      items: finalItems,
    }

    if (isEditing && invoice) {
      updateInvoice.mutate(
        { id: invoice.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createInvoice.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createInvoice.isPending || updateInvoice.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? 'Modifiez les details de cette facture.'
              : 'Creez une nouvelle facture pour votre client.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Buyer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nom du client</Label>
              <Input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Nom complet"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email du client</Label>
              <Input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Adresse du client</Label>
            <Textarea
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="Adresse complete..."
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white resize-none"
              rows={2}
            />
          </div>

          {/* Dates and status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Date d'emission</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Date d'echeance</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Taux TVA (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-gray-300">Statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Invoice['status'])}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="draft" className="text-white">Brouillon</SelectItem>
                <SelectItem value="sent" className="text-white">Envoyee</SelectItem>
                <SelectItem value="paid" className="text-white">Payee</SelectItem>
                <SelectItem value="overdue" className="text-white">En retard</SelectItem>
                <SelectItem value="cancelled" className="text-white">Annulee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300 text-sm font-medium">Articles</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantite</div>
                <div className="col-span-2">Prix unitaire</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="col-span-5 bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="col-span-2 bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    className="col-span-2 bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm"
                  />
                  <p className="col-span-2 text-right text-sm text-gray-300">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </p>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-red-500"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Sous-total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>TVA ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes ou conditions..."
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white resize-none"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] text-gray-400 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              {isPending
                ? 'Enregistrement...'
                : isEditing
                  ? 'Modifier'
                  : 'Creer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
