import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Mail, Phone, Clock } from 'lucide-react'
import type { TmAccount } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TmAccountCardProps {
  account: TmAccount
  onEdit: (account: TmAccount) => void
  onDelete: (account: TmAccount) => void
}

const statusConfig: Record<
  TmAccount['status'],
  { color: string; label: string }
> = {
  active: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'statusActive' },
  suspended: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'statusSuspended' },
  banned: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'statusBanned' },
  unknown: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'statusUnknown' },
}

export function TmAccountCard({ account, onEdit, onDelete }: TmAccountCardProps) {
  const { t } = useTranslation('tmAccounts')
  const config = statusConfig[account.status]

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
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">
            {account.display_name || account.email}
          </h3>
          {account.display_name && (
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{account.email}</span>
            </div>
          )}
        </div>
        <Badge className={config.color}>{t(config.label)}</Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {account.phone && (
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            {t('lastChecked')}: {formatDate(account.last_checked)}
          </span>
        </div>

        {account.notes && (
          <p className="text-sm text-gray-500 line-clamp-2">{account.notes}</p>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(account)}
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
          >
            <Pencil className="h-4 w-4 mr-1" />
            {t('edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t('delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
