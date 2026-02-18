import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useCreateTreasuryEntry, useUpdateTreasuryEntry } from '@/hooks/useTreasury'
import type { TreasuryEntry } from '@/types'

interface TreasuryEntryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: TreasuryEntry | null
}

const CATEGORIES = [
  'ventes',
  'achats',
  'abonnements',
  'frais_plateforme',
  'livraison',
  'marketing',
  'outils',
  'autre',
]

export function TreasuryEntryFormModal({
  open,
  onOpenChange,
  entry,
}: TreasuryEntryFormModalProps) {
  const isEditing = !!entry

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  const createEntry = useCreateTreasuryEntry()
  const updateEntry = useUpdateTreasuryEntry()

  useEffect(() => {
    if (entry) {
      setType(entry.type)
      setCategory(entry.category ?? '')
      setAmount(String(entry.amount))
      setDescription(entry.description ?? '')
      setEntryDate(entry.entry_date)
      setPaymentMethod(entry.payment_method ?? '')
      setIsRecurring(entry.is_recurring)
    } else {
      setType('expense')
      setCategory('')
      setAmount('')
      setDescription('')
      setEntryDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('')
      setIsRecurring(false)
    }
  }, [entry, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      type,
      category: category || null,
      amount: parseFloat(amount),
      description: description || null,
      entry_date: entryDate,
      payment_method: paymentMethod || null,
      is_recurring: isRecurring,
    }

    if (isEditing && entry) {
      updateEntry.mutate(
        { id: entry.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createEntry.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createEntry.isPending || updateEntry.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? 'Modifiez les details de cette transaction.'
              : 'Ajoutez une nouvelle transaction a votre tresorerie.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="space-y-2">
            <Label className="text-gray-300">Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={
                  type === 'income'
                    ? 'bg-emerald-600 hover:bg-emerald-700 flex-1'
                    : 'border-[#2a2a2a] text-gray-400 hover:text-white flex-1'
                }
                onClick={() => setType('income')}
              >
                Revenu
              </Button>
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                className={
                  type === 'expense'
                    ? 'bg-red-600 hover:bg-red-700 flex-1'
                    : 'border-[#2a2a2a] text-gray-400 hover:text-white flex-1'
                }
                onClick={() => setType('expense')}
              >
                Depense
              </Button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-gray-300">Categorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Selectionner une categorie" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-white">
                    {cat.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-gray-300">Montant</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la transaction..."
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white resize-none"
              rows={2}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-gray-300">Date</Label>
            <Input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label className="text-gray-300">Moyen de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Selectionner un moyen de paiement" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="card" className="text-white">Carte bancaire</SelectItem>
                <SelectItem value="bank_transfer" className="text-white">Virement</SelectItem>
                <SelectItem value="cash" className="text-white">Especes</SelectItem>
                <SelectItem value="paypal" className="text-white">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Recurrent</Label>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
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
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
