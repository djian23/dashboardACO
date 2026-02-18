import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, TrendingUp } from 'lucide-react'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

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

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()

  const potentialProfit =
    product.purchase_price != null && product.listing_price != null
      ? product.listing_price - product.purchase_price
      : null

  return (
    <div
      className="group cursor-pointer rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#7c3aed]/50"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Image placeholder */}
      <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-[#0f0f0f]">
        {product.image_urls && product.image_urls.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>

      {/* Badges row */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge className={CATEGORY_COLORS[product.category]}>
          {t(`categories.${product.category}`)}
        </Badge>
        <Badge className={STATUS_COLORS[product.status]}>
          {t(`statuses.${product.status}`)}
        </Badge>
        {product.condition && (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            {t(`conditions.${product.condition}`)}
          </Badge>
        )}
      </div>

      {/* Product info */}
      <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-[#7c3aed]">
        {product.name}
      </h3>
      {product.brand && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.brand}</p>
      )}

      {/* Prices */}
      <div className="mt-3 flex items-end justify-between">
        <div className="space-y-0.5">
          {product.purchase_price != null && (
            <p className="text-xs text-muted-foreground">
              {t('card.purchased')}: {formatCurrency(product.purchase_price)}
            </p>
          )}
          {product.listing_price != null && (
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(product.listing_price)}
            </p>
          )}
        </div>

        {potentialProfit != null && (
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-3.5 w-3.5 ${
                potentialProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                potentialProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {potentialProfit >= 0 ? '+' : ''}
              {formatCurrency(potentialProfit)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
