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
import {
  useCreateSubscription,
  useUpdateSubscription,
} from '@/hooks/useSubscriptions'
import type { Subscription } from '@/types'

interface SubscriptionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null
}

const CATEGORIES = [
  'plateforme',
  'logiciel',
  'stockage',
  'marketing',
  'hebergement',
  'autre',
]

export function SubscriptionFormModal({
  open,
  onOpenChange,
  subscription,
}: SubscriptionFormModalProps) {
  const isEditing = !!subscription

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [nextBillingDate, setNextBillingDate] = useState('')
  const [category, setCategory] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')

  const createSubscription = useCreateSubscription()
  const updateSubscription = useUpdateSubscription()

  useEffect(() => {
    if (subscription) {
      setName(subscription.name)
      setAmount(String(subscription.amount))
      setBillingCycle(subscription.billing_cycle)
      setNextBillingDate(subscription.next_billing_date ?? '')
      setCategory(subscription.category ?? '')
      setIsActive(subscription.is_active)
      setNotes(subscription.notes ?? '')
    } else {
      setName('')
      setAmount('')
      setBillingCycle('monthly')
      setNextBillingDate('')
      setCategory('')
      setIsActive(true)
      setNotes('')
    }
  }, [subscription, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name,
      amount: parseFloat(amount),
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate || null,
      category: category || null,
      is_active: isActive,
      notes: notes || null,
    }

    if (isEditing && subscription) {
      updateSubscription.mutate(
        { id: subscription.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createSubscription.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createSubscription.isPending || updateSubscription.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? 'Modifiez les details de cet abonnement.'
              : 'Ajoutez un nouvel abonnement a suivre.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-gray-300">Nom</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Spotify, StockX Pro..."
              required
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
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

          {/* Billing cycle */}
          <div className="space-y-2">
            <Label className="text-gray-300">Cycle de facturation</Label>
            <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'quarterly' | 'yearly')}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="monthly" className="text-white">Mensuel</SelectItem>
                <SelectItem value="quarterly" className="text-white">Trimestriel</SelectItem>
                <SelectItem value="yearly" className="text-white">Annuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next billing date */}
          <div className="space-y-2">
            <Label className="text-gray-300">Prochaine facturation</Label>
            <Input
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
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
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Actif</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes supplementaires..."
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
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
