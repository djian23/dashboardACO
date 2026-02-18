import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, UserCircle } from 'lucide-react'
import type { TmAccount } from '@/types'
import { useTmAccounts, useDeleteTmAccount } from '@/hooks/useTmAccounts'
import { TmAccountFormModal } from '@/components/tm-accounts/TmAccountFormModal'
import { TmAccountCard } from '@/components/tm-accounts/TmAccountCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

export default function TmAccountsPage() {
  const { t } = useTranslation('tmAccounts')
  const { data: accounts, isLoading } = useTmAccounts()
  const deleteAccount = useDeleteTmAccount()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<TmAccount | undefined>()
  const [deletingAccount, setDeletingAccount] = useState<TmAccount | null>(null)

  const handleEdit = (account: TmAccount) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingAccount(undefined)
  }

  const handleDelete = (account: TmAccount) => {
    setDeletingAccount(account)
  }

  const confirmDelete = async () => {
    if (deletingAccount) {
      await deleteAccount.mutateAsync(deletingAccount.id)
      setDeletingAccount(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addAccount')}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && accounts && accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserCircle className="h-16 w-16 text-gray-600 mb-4" />
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
            {t('addFirstAccount')}
          </Button>
        </div>
      )}

      {/* Account grid */}
      {!isLoading && accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <TmAccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <TmAccountFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        account={editingAccount}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingAccount}
        onOpenChange={(open) => !open && setDeletingAccount(null)}
      >
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('confirmDeleteDescription', {
                email: deletingAccount?.email,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAccount(null)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
