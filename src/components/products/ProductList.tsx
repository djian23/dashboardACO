import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ProductListProps {
  products: Product[]
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

function calculateProfit(product: Product): number | null {
  if (product.purchase_price == null || product.listing_price == null) return null
  return product.listing_price - product.purchase_price
}

export function ProductList({ products }: ProductListProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] hover:bg-transparent">
            <TableHead className="text-muted-foreground">{t('table.name')}</TableHead>
            <TableHead className="text-muted-foreground">{t('table.category')}</TableHead>
            <TableHead className="text-muted-foreground">{t('table.brand')}</TableHead>
            <TableHead className="text-muted-foreground">{t('table.size')}</TableHead>
            <TableHead className="text-muted-foreground">{t('table.condition')}</TableHead>
            <TableHead className="text-right text-muted-foreground">{t('table.purchasePrice')}</TableHead>
            <TableHead className="text-right text-muted-foreground">{t('table.listingPrice')}</TableHead>
            <TableHead className="text-muted-foreground">{t('table.status')}</TableHead>
            <TableHead className="text-right text-muted-foreground">{t('table.profit')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const profit = calculateProfit(product)

            return (
              <TableRow
                key={product.id}
                className="cursor-pointer border-[#2a2a2a] hover:bg-[#2a2a2a]/50"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <TableCell className="font-medium text-foreground">
                  {product.name}
                </TableCell>
                <TableCell>
                  <Badge className={CATEGORY_COLORS[product.category]}>
                    {t(`categories.${product.category}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.brand ?? '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.size ?? '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.condition ? t(`conditions.${product.condition}`) : '-'}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.purchase_price != null
                    ? formatCurrency(product.purchase_price)
                    : '-'}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {product.listing_price != null
                    ? formatCurrency(product.listing_price)
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[product.status]}>
                    {t(`statuses.${product.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {profit != null ? (
                    <span
                      className={
                        profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }
                    >
                      {profit >= 0 ? '+' : ''}
                      {formatCurrency(profit)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
