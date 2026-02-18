import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  ShoppingCart,
  Star,
  Plus,
  ExternalLink,
  Package,
  Loader2,
} from 'lucide-react'
import { useProduct, useDeleteProduct } from '@/hooks/useProducts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ProductFormModal } from '@/components/products/ProductFormModal'
import { SaleFormModal } from '@/components/products/SaleFormModal'
import type { Product } from '@/types'

const STATUS_COLORS: Record<Product['status'], string> = {
  in_stock: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  listed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  sold: 'bg-green-500/20 text-green-400 border-green-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  returned: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const CATEGORY_COLORS: Record<Product['category'], string> = {
  sneakers: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  clothing: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  electronics: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  collectibles: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  accessories: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('products')

  const { data: product, isLoading } = useProduct(productId ?? '')
  const deleteProduct = useDeleteProduct()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)

  const handleDelete = async () => {
    if (!productId) return
    try {
      await deleteProduct.mutateAsync(productId)
      navigate('/products')
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md bg-[#1a1a1a]" />
          <Skeleton className="h-8 w-64 rounded-md bg-[#1a1a1a]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-[#1a1a1a]" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-[#1a1a1a]" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-semibold text-foreground">
          {t('detail.notFound')}
        </p>
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mt-4 text-[#7c3aed] hover:text-[#7c3aed]/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('detail.backToProducts')}
        </Button>
      </div>
    )
  }

  const profit =
    product.purchase_price != null && product.listing_price != null
      ? product.listing_price - product.purchase_price
      : null

  const totalSalesRevenue =
    product.sales?.reduce((sum, sale) => sum + sale.sale_price_total, 0) ?? 0
  const totalSalesFees =
    product.sales?.reduce((sum, sale) => sum + sale.fees + sale.shipping_cost, 0) ?? 0
  const actualProfit =
    product.purchase_price != null
      ? totalSalesRevenue - totalSalesFees - product.purchase_price
      : null

  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en'

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/products')}
          className="shrink-0 text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <Badge className={STATUS_COLORS[product.status]}>
              {t(`statuses.${product.status}`)}
            </Badge>
            <Badge className={CATEGORY_COLORS[product.category]}>
              {t(`categories.${product.category}`)}
            </Badge>
          </div>
          {product.brand && (
            <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
          )}
          {product.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {product.vinted_url && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground"
            >
              <a href={product.vinted_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEditModal(true)}
            className="text-muted-foreground hover:bg-[#1a1a1a] hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Purchase price */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('detail.purchasePrice')}</p>
              <p className="mt-0.5 truncate text-xl font-bold text-foreground">
                {product.purchase_price != null
                  ? formatCurrency(product.purchase_price)
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Listing price */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-400">
              <Tag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('detail.listingPrice')}</p>
              <p className="mt-0.5 truncate text-xl font-bold text-foreground">
                {product.listing_price != null
                  ? formatCurrency(product.listing_price)
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {product.sales && product.sales.length > 0
                  ? t('detail.actualProfit')
                  : t('detail.potentialProfit')}
              </p>
              {product.sales && product.sales.length > 0 ? (
                <p
                  className={`mt-0.5 truncate text-xl font-bold ${
                    actualProfit != null && actualProfit >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {actualProfit != null
                    ? `${actualProfit >= 0 ? '+' : ''}${formatCurrency(actualProfit)}`
                    : '-'}
                </p>
              ) : (
                <p
                  className={`mt-0.5 truncate text-xl font-bold ${
                    profit != null && profit >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {profit != null
                    ? `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`
                    : '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7c3aed]/15 text-[#7c3aed]">
              <Star className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('detail.condition')}</p>
              <p className="mt-0.5 truncate text-xl font-bold text-foreground">
                {product.condition
                  ? t(`conditions.${product.condition}`)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Details card */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t('detail.details')}
          </h2>
          <dl className="space-y-3">
            {product.sku && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('detail.sku')}</dt>
                <dd className="text-sm font-medium text-foreground">{product.sku}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">{t('detail.quantity')}</dt>
              <dd className="text-sm font-medium text-foreground">{product.quantity}</dd>
            </div>
            {product.size && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('detail.size')}</dt>
                <dd className="text-sm font-medium text-foreground">{product.size}</dd>
              </div>
            )}
            {product.purchase_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('detail.purchaseDate')}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDate(product.purchase_date, lang)}
                </dd>
              </div>
            )}
            {product.purchase_source && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">{t('detail.purchaseSource')}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {product.purchase_source}
                </dd>
              </div>
            )}
            {product.notes && (
              <div className="pt-2">
                <dt className="mb-1 text-sm text-muted-foreground">{t('detail.notes')}</dt>
                <dd className="rounded-md bg-[#0f0f0f] p-3 text-sm text-foreground">
                  {product.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Sales history */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {t('detail.salesHistory')}
            </h2>
            <Button
              size="sm"
              onClick={() => setShowSaleModal(true)}
              className="gap-1.5 bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('detail.addSale')}
            </Button>
          </div>

          {!product.sales || product.sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                {t('detail.noSales')}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#2a2a2a]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableHead className="text-muted-foreground">{t('detail.saleDate')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('detail.salePlatform')}</TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      {t('detail.saleAmount')}
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      {t('detail.saleFees')}
                    </TableHead>
                    <TableHead className="text-muted-foreground">{t('detail.saleStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.sales.map((sale) => (
                    <TableRow key={sale.id} className="border-[#2a2a2a]">
                      <TableCell className="text-foreground">
                        {formatDate(sale.sale_date, lang)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sale.sale_platform ?? '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {formatCurrency(sale.sale_price_total)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(sale.fees + sale.shipping_cost)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            sale.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : sale.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : sale.status === 'refunded'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }
                        >
                          {t(`saleStatuses.${sale.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        product={product}
      />

      <SaleFormModal
        open={showSaleModal}
        onOpenChange={setShowSaleModal}
        productId={product.id}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title={t('delete.title')}
        description={t('delete.description')}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
