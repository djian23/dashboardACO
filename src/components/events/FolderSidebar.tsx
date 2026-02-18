import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderIcon, Plus, Trash2, X } from 'lucide-react'
import { useFolders, useCreateFolder, useDeleteFolder } from '@/hooks/useFolders'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FolderSidebarProps {
  selectedFolderId?: string
  onFolderSelect: (id?: string) => void
}

const FOLDER_COLORS = [
  '#7c3aed', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
  '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4',
]

export function FolderSidebar({ selectedFolderId, onFolderSelect }: FolderSidebarProps) {
  const { t } = useTranslation('events')
  const { data: folders, isLoading } = useFolders()
  const createFolder = useCreateFolder()
  const deleteFolder = useDeleteFolder()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])

  const handleCreateFolder = async (e: FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      await createFolder.mutateAsync({
        name: newFolderName.trim(),
        color: newFolderColor,
      })
      setNewFolderName('')
      setNewFolderColor(FOLDER_COLORS[0])
      setShowAddForm(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm(t('folders.deleteConfirm'))) {
      await deleteFolder.mutateAsync(folderId)
      if (selectedFolderId === folderId) {
        onFolderSelect(undefined)
      }
    }
  }

  return (
    <div className="flex h-full w-[240px] flex-col border-r border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
        <h3 className="text-sm font-semibold">{t('folders.title')}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-[#7c3aed]"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateFolder} className="border-b border-[#2a2a2a] p-3 space-y-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder={t('folders.namePlaceholder')}
            className="h-8 text-sm border-[#2a2a2a] bg-[#0f0f0f]"
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewFolderColor(color)}
                className={cn(
                  'h-5 w-5 rounded-full transition-all',
                  newFolderColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1a1a1a]' : 'opacity-60 hover:opacity-100'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!newFolderName.trim() || createFolder.isPending}
            className="w-full h-7 text-xs bg-[#7c3aed] hover:bg-[#7c3aed]/90"
          >
            {createFolder.isPending ? t('folders.creating') : t('folders.create')}
          </Button>
        </form>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          <button
            onClick={() => onFolderSelect(undefined)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              !selectedFolderId
                ? 'bg-[#7c3aed]/10 text-[#7c3aed]'
                : 'text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground'
            )}
          >
            <FolderIcon className="h-4 w-4" />
            <span className="flex-1 text-left">{t('folders.allEvents')}</span>
          </button>

          {isLoading ? (
            <div className="space-y-1 px-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-[#2a2a2a]" />
              ))}
            </div>
          ) : (
            folders?.map((folder) => (
              <div key={folder.id} className="group flex items-center">
                <button
                  onClick={() => onFolderSelect(folder.id)}
                  className={cn(
                    'flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    selectedFolderId === folder.id
                      ? 'bg-[#7c3aed]/10 text-[#7c3aed]'
                      : 'text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground'
                  )}
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 flex-shrink-0 mr-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
