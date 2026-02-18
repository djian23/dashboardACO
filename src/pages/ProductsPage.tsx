import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  LayoutList,
  LayoutGrid,
  Package,
  FolderOpen,
  Folder,
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useFolders } from '@/hooks/useFolders'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { ProductList } from '@/components/products/ProductList'
import { ProductCard } from '@/components/products/ProductCard'
import {
  ProductFilters,
  type ProductFiltersState,
} from '@/components/products/ProductFilters'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'card'

export default function ProductsPage() {
  const { t } = useTranslation('products')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined)
  const [filters, setFilters] = useState<ProductFiltersState>({
    search: '',
    category: '',
    status: '',
    condition: '',
  })

  const { data: folders, isLoading: foldersLoading } = useFolders()
  const { data: products, isLoading: productsLoading } = useProducts({
    folderId: selectedFolderId,
    category: filters.category || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
  })

  // Apply condition filter client-side since the hook doesn't support it
  const filteredProducts = products?.filter((p) => {
    if (filters.condition && p.condition !== filters.condition) return false
    return true
  })

  return (
    <div className="flex h-full">
      {/* Folder sidebar */}
      <aside className="hidden w-[240px] shrink-0 border-r border-[#2a2a2a] bg-[#0f0f0f] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-[#2a2a2a] px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              {t('folders.title')}
            </h3>
          </div>
          <ScrollArea className="flex-1 px-2 py-2">
            {/* All products */}
            <button
              onClick={() => setSelectedFolderId(undefined)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                selectedFolderId === undefined
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
              )}
            >
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('folders.all')}</span>
            </button>

            {foldersLoading ? (
              <div className="mt-2 space-y-1 px-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md bg-[#2a2a2a]" />
                ))}
              </div>
            ) : (
              <div className="mt-1 space-y-0.5">
                {folders?.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      selectedFolderId === folder.id
                        ? 'bg-[#7c3aed] text-white'
                        : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
                    )}
                  >
                    {selectedFolderId === folder.id ? (
                      <FolderOpen className="h-4 w-4 shrink-0" style={{ color: folder.color }} />
                    ) : (
                      <Folder className="h-4 w-4 shrink-0" style={{ color: folder.color }} />
                    )}
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#2a2a2a] px-4 py-3 sm:px-6">
          <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn(
                'h-8 w-8 rounded-r-none',
                viewMode === 'list'
                  ? 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 hover:text-white'
                  : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('card')}
              className={cn(
                'h-8 w-8 rounded-l-none',
                viewMode === 'card'
                  ? 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 hover:text-white'
                  : 'text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Add product */}
          <Button
            onClick={() => setShowFormModal(true)}
            className="gap-2 bg-[#7c3aed] hover:bg-[#7c3aed]/90"
          >
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Button>
        </div>

        {/* Filters */}
        <div className="border-b border-[#2a2a2a] px-4 py-3 sm:px-6">
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 py-4 sm:px-6">
          {productsLoading ? (
            viewMode === 'list' ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg bg-[#1a1a1a]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl bg-[#1a1a1a]" />
                ))}
              </div>
            )
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('empty.title')}
              description={t('empty.description')}
              action={{
                label: t('addProduct'),
                onClick: () => setShowFormModal(true),
              }}
            />
          ) : viewMode === 'list' ? (
            <ProductList products={filteredProducts} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      <ProductFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
      />
    </div>
  )
}
