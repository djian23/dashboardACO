import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { useFolders } from '@/hooks/useFolders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventFiltersType {
  search?: string
  category?: string
  status?: string
  folderId?: string
}

interface EventFiltersProps {
  filters: EventFiltersType
  onFiltersChange: (filters: EventFiltersType) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const { t } = useTranslation('events')
  const { data: folders } = useFolders()

  const hasActiveFilters = filters.search || filters.category || filters.status || filters.folderId

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          placeholder={t('filters.searchPlaceholder')}
          className="pl-9 border-[#2a2a2a] bg-[#0f0f0f]"
        />
      </div>

      <Select
        value={filters.category ?? 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, category: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.category')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
          <SelectItem value="concert">{t('categories.concert')}</SelectItem>
          <SelectItem value="football">{t('categories.football')}</SelectItem>
          <SelectItem value="tennis">{t('categories.tennis')}</SelectItem>
          <SelectItem value="rugby">{t('categories.rugby')}</SelectItem>
          <SelectItem value="other">{t('categories.other')}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.status')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
          <SelectItem value="upcoming">{t('statuses.upcoming')}</SelectItem>
          <SelectItem value="ongoing">{t('statuses.ongoing')}</SelectItem>
          <SelectItem value="completed">{t('statuses.completed')}</SelectItem>
          <SelectItem value="cancelled">{t('statuses.cancelled')}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.folderId ?? 'all'}
        onValueChange={(v) => onFiltersChange({ ...filters, folderId: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.folder')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="all">{t('filters.allFolders')}</SelectItem>
          {folders?.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  )
}
