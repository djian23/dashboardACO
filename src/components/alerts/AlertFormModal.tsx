import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Alert } from '@/types'
import { useCreateAlert, useUpdateAlert } from '@/hooks/useAlerts'
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
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AlertFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alert?: Alert
}

const ALERT_TYPES: Alert['type'][] = [
  'billetterie_opening',
  'presale',
  'transfer_reminder',
  'payment_reminder',
  'price_drop',
  'custom',
]

const CHECK_INTERVALS = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1h' },
  { value: '120', label: '2h' },
  { value: '360', label: '6h' },
  { value: '1440', label: '24h' },
]

const NOTIFICATION_CHANNELS = ['in_app', 'discord', 'email'] as const

export function AlertFormModal({
  open,
  onOpenChange,
  alert,
}: AlertFormModalProps) {
  const { t } = useTranslation('alerts')
  const createAlert = useCreateAlert()
  const updateAlert = useUpdateAlert()

  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as Alert['type'],
    discord_webhook_url: '',
    is_active: true,
    check_interval_minutes: 60,
    notification_channels: ['in_app'] as string[],
  })

  useEffect(() => {
    if (alert) {
      setFormData({
        name: alert.name,
        type: alert.type,
        discord_webhook_url: alert.discord_webhook_url ?? '',
        is_active: alert.is_active,
        check_interval_minutes: alert.check_interval_minutes,
        notification_channels: alert.notification_channels ?? ['in_app'],
      })
    } else {
      setFormData({
        name: '',
        type: 'custom',
        discord_webhook_url: '',
        is_active: true,
        check_interval_minutes: 60,
        notification_channels: ['in_app'],
      })
    }
  }, [alert, open])

  const isEditing = !!alert

  const handleChannelToggle = (channel: string) => {
    setFormData((prev) => {
      const channels = prev.notification_channels.includes(channel)
        ? prev.notification_channels.filter((c) => c !== channel)
        : [...prev.notification_channels, channel]
      return { ...prev, notification_channels: channels }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      type: formData.type,
      discord_webhook_url: formData.discord_webhook_url || null,
      is_active: formData.is_active,
      check_interval_minutes: formData.check_interval_minutes,
      notification_channels: formData.notification_channels,
      conditions: {},
    }

    if (isEditing) {
      await updateAlert.mutateAsync({ id: alert.id, ...payload })
    } else {
      await createAlert.mutateAsync(payload)
    }

    onOpenChange(false)
  }

  const isPending = createAlert.isPending || updateAlert.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? t('editAlert') : t('createAlert')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? t('editAlertDescription')
              : t('createAlertDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              {t('alertName')}
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder={t('alertNamePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-300">
              {t('alertType')}
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: Alert['type']) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {ALERT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`type_${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord_webhook_url" className="text-gray-300">
              {t('discordWebhookUrl')}
            </Label>
            <Input
              id="discord_webhook_url"
              value={formData.discord_webhook_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  discord_webhook_url: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-gray-300">
              {t('isActive')}
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_interval" className="text-gray-300">
              {t('checkInterval')}
            </Label>
            <Select
              value={String(formData.check_interval_minutes)}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  check_interval_minutes: Number(value),
                }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {CHECK_INTERVALS.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">
              {t('notificationChannels')}
            </Label>
            <div className="space-y-2">
              {NOTIFICATION_CHANNELS.map((channel) => (
                <div
                  key={channel}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    id={`channel_${channel}`}
                    checked={formData.notification_channels.includes(channel)}
                    onCheckedChange={() => handleChannelToggle(channel)}
                    className="border-[#2a2a2a] data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed]"
                  />
                  <Label
                    htmlFor={`channel_${channel}`}
                    className="text-gray-400 text-sm font-normal cursor-pointer"
                  >
                    {t(`channel_${channel}`)}
                  </Label>
                </div>
              ))}
            </div>
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
