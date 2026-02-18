import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Mail, MessageSquare } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function NotificationSettings() {
  const { t } = useTranslation('settings')
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const [formData, setFormData] = useState({
    notification_email: false,
    notification_in_app: true,
    discord_global_webhook: '',
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        notification_email: settings.notification_email,
        notification_in_app: settings.notification_in_app,
        discord_global_webhook: settings.discord_global_webhook ?? '',
      })
    }
  }, [settings])

  const handleSave = () => {
    updateSettings.mutate({
      notification_email: formData.notification_email,
      notification_in_app: formData.notification_in_app,
      discord_global_webhook: formData.discord_global_webhook || null,
    })
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#7c3aed]" />
          {t('notifications')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <Label className="text-gray-300">
                {t('emailNotifications')}
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('emailNotificationsDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={formData.notification_email}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, notification_email: checked }))
            }
          />
        </div>

        {/* In-app notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-gray-400" />
            <div>
              <Label className="text-gray-300">
                {t('inAppNotifications')}
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('inAppNotificationsDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={formData.notification_in_app}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                notification_in_app: checked,
              }))
            }
          />
        </div>

        {/* Discord webhook */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <Label htmlFor="discord_webhook" className="text-gray-300">
              {t('discordGlobalWebhook')}
            </Label>
          </div>
          <Input
            id="discord_webhook"
            value={formData.discord_global_webhook}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                discord_global_webhook: e.target.value,
              }))
            }
            className="bg-[#0f0f0f] border-[#2a2a2a] text-white max-w-lg"
            placeholder="https://discord.com/api/webhooks/..."
          />
          <p className="text-xs text-gray-500">
            {t('discordWebhookDescription')}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          {updateSettings.isPending ? t('saving') : t('save')}
        </Button>
      </CardContent>
    </Card>
  )
}
