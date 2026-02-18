import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface ProductFiltersState {
  search: string
  category: string
  status: string
  condition: string
}

interface ProductFiltersProps {
  filters: ProductFiltersState
  onFiltersChange: (filters: ProductFiltersState) => void
}

const CATEGORIES = ['sneakers', 'clothing', 'electronics', 'collectibles', 'accessories', 'other'] as const
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const
const STATUSES = ['in_stock', 'listed', 'sold', 'shipped', 'returned'] as const

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const { t } = useTranslation('products')

  const hasFilters = filters.category || filters.status || filters.condition || filters.search

  const clearFilters = () => {
    onFiltersChange({ search: '', category: '', status: '', condition: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder={t('filters.searchPlaceholder')}
          className="border-[#2a2a2a] bg-[#0f0f0f] pl-9"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.category}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, category: value === '_all' ? '' : value })
        }
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.allCategories')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="_all">{t('filters.allCategories')}</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`categories.${cat}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value === '_all' ? '' : value })
        }
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="_all">{t('filters.allStatuses')}</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`statuses.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Condition */}
      <Select
        value={filters.condition}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, condition: value === '_all' ? '' : value })
        }
      >
        <SelectTrigger className="w-[160px] border-[#2a2a2a] bg-[#0f0f0f]">
          <SelectValue placeholder={t('filters.allConditions')} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
          <SelectItem value="_all">{t('filters.allConditions')}</SelectItem>
          {CONDITIONS.map((cond) => (
            <SelectItem key={cond} value={cond}>
              {t(`conditions.${cond}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1.5 text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  )
}
