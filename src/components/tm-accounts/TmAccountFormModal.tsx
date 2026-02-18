import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import type { TmAccount } from '@/types'
import { useCreateTmAccount, useUpdateTmAccount } from '@/hooks/useTmAccounts'
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

interface TmAccountFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: TmAccount
}

export function TmAccountFormModal({
  open,
  onOpenChange,
  account,
}: TmAccountFormModalProps) {
  const { t } = useTranslation('tmAccounts')
  const createAccount = useCreateTmAccount()
  const updateAccount = useUpdateTmAccount()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    encrypted_password: '',
    display_name: '',
    phone: '',
    status: 'active' as TmAccount['status'],
    notes: '',
  })

  useEffect(() => {
    if (account) {
      setFormData({
        email: account.email,
        encrypted_password: account.encrypted_password,
        display_name: account.display_name ?? '',
        phone: account.phone ?? '',
        status: account.status,
        notes: account.notes ?? '',
      })
    } else {
      setFormData({
        email: '',
        encrypted_password: '',
        display_name: '',
        phone: '',
        status: 'active',
        notes: '',
      })
    }
    setShowPassword(false)
  }, [account, open])

  const isEditing = !!account

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      email: formData.email,
      encrypted_password: formData.encrypted_password,
      display_name: formData.display_name || null,
      phone: formData.phone || null,
      status: formData.status,
      notes: formData.notes || null,
    }

    if (isEditing) {
      await updateAccount.mutateAsync({ id: account.id, ...payload })
    } else {
      await createAccount.mutateAsync(payload)
    }

    onOpenChange(false)
  }

  const isPending = createAccount.isPending || updateAccount.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? t('editAccount') : t('addAccount')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? t('editAccountDescription')
              : t('addAccountDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder="email@ticketmaster.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              {t('password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.encrypted_password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    encrypted_password: e.target.value,
                  }))
                }
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-gray-300">
              {t('displayName')}
            </Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">
              {t('phone')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
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
              onValueChange={(value: TmAccount['status']) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="active">{t('statusActive')}</SelectItem>
                <SelectItem value="suspended">
                  {t('statusSuspended')}
                </SelectItem>
                <SelectItem value="banned">{t('statusBanned')}</SelectItem>
                <SelectItem value="unknown">{t('statusUnknown')}</SelectItem>
              </SelectContent>
            </Select>
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
