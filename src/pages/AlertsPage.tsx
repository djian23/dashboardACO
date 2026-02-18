import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Bell, Pencil, Trash2 } from 'lucide-react'
import type { Alert } from '@/types'
import {
  useAlerts,
  useDeleteAlert,
  useToggleAlert,
  useUpdateAlert,
} from '@/hooks/useAlerts'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { AlertFormModal } from '@/components/alerts/AlertFormModal'
import { DiscordWebhookConfig } from '@/components/alerts/DiscordWebhookConfig'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

const typeStyles: Record<Alert['type'], string> = {
  billetterie_opening: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  presale: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  transfer_reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  payment_reminder: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  price_drop: 'bg-green-500/20 text-green-400 border-green-500/30',
  custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function AlertsPage() {
  const { t } = useTranslation('alerts')
  const { data: alerts, isLoading } = useAlerts()
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const deleteAlert = useDeleteAlert()
  const toggleAlert = useToggleAlert()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>()
  const [deletingAlert, setDeletingAlert] = useState<Alert | null>(null)

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingAlert(undefined)
  }

  const handleToggle = (id: string, isActive: boolean) => {
    toggleAlert.mutate({ id, isActive })
  }

  const confirmDelete = async () => {
    if (deletingAlert) {
      await deleteAlert.mutateAsync(deletingAlert.id)
      setDeletingAlert(null)
    }
  }

  const handleWebhookChange = (url: string) => {
    updateSettings.mutate({ discord_global_webhook: url || null })
  }

  const handleWebhookTest = () => {
    // Simulated test - in production this would send a real test message
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('never')
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('createAlert')}
        </Button>
      </div>

      {/* Discord webhook config */}
      <DiscordWebhookConfig
        webhookUrl={settings?.discord_global_webhook ?? ''}
        onChange={handleWebhookChange}
        onTest={handleWebhookTest}
      />

      <Separator className="bg-[#2a2a2a]" />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && alerts && alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-16 w-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {t('emptyTitle')}
          </h2>
          <p className="text-gray-400 mb-6 max-w-md">
            {t('emptyDescription')}
          </p>
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('createFirstAlert')}
          </Button>
        </div>
      )}

      {/* Alerts list */}
      {!isLoading && alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Toggle */}
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) =>
                        handleToggle(alert.id, checked)
                      }
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-white truncate">
                          {alert.name}
                        </h3>
                        <Badge className={typeStyles[alert.type]}>
                          {t(`type_${alert.type}`)}
                        </Badge>
                        <Badge
                          className={
                            alert.is_active
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }
                        >
                          {alert.is_active ? t('active') : t('inactive')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {t('lastTriggered')}:{' '}
                          {formatDate(alert.last_triggered)}
                        </span>
                        <span>
                          {t('channels')}:{' '}
                          {alert.notification_channels
                            .map((c) => t(`channel_${c}`))
                            .join(', ')}
                        </span>
                        <span>
                          {t('interval')}: {alert.check_interval_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(alert)}
                      className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingAlert(alert)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form modal */}
      <AlertFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        alert={editingAlert}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!deletingAlert}
        onOpenChange={(open) => !open && setDeletingAlert(null)}
      >
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('confirmDeleteDescription', {
                name: deletingAlert?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAlert(null)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteAlert.isPending}
            >
              {deleteAlert.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
