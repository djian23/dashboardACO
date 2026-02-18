import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/types'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useFolders } from '@/hooks/useFolders'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
}

const CATEGORIES = ['sneakers', 'clothing', 'electronics', 'collectibles', 'accessories', 'other'] as const
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const
const STATUSES = ['in_stock', 'listed', 'sold', 'shipped', 'returned'] as const

export function ProductFormModal({ open, onOpenChange, product }: ProductFormModalProps) {
  const { t } = useTranslation('products')
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const { data: folders } = useFolders()

  const isEditing = !!product

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other' as Product['category'],
    brand: '',
    size: '',
    condition: '' as string,
    purchase_price: '',
    purchase_date: '',
    purchase_source: '',
    listing_price: '',
    quantity: '1',
    status: 'in_stock' as Product['status'],
    sku: '',
    vinted_url: '',
    notes: '',
    folder_id: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description ?? '',
        category: product.category,
        brand: product.brand ?? '',
        size: product.size ?? '',
        condition: product.condition ?? '',
        purchase_price: product.purchase_price?.toString() ?? '',
        purchase_date: product.purchase_date ?? '',
        purchase_source: product.purchase_source ?? '',
        listing_price: product.listing_price?.toString() ?? '',
        quantity: product.quantity.toString(),
        status: product.status,
        sku: product.sku ?? '',
        vinted_url: product.vinted_url ?? '',
        notes: product.notes ?? '',
        folder_id: product.folder_id ?? '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'other',
        brand: '',
        size: '',
        condition: '',
        purchase_price: '',
        purchase_date: '',
        purchase_source: '',
        listing_price: '',
        quantity: '1',
        status: 'in_stock',
        sku: '',
        vinted_url: '',
        notes: '',
        folder_id: '',
      })
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: Partial<Product> = {
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      brand: formData.brand || null,
      size: formData.size || null,
      condition: (formData.condition as Product['condition']) || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      purchase_date: formData.purchase_date || null,
      purchase_source: formData.purchase_source || null,
      listing_price: formData.listing_price ? parseFloat(formData.listing_price) : null,
      quantity: parseInt(formData.quantity, 10) || 1,
      status: formData.status,
      sku: formData.sku || null,
      vinted_url: formData.vinted_url || null,
      notes: formData.notes || null,
      folder_id: formData.folder_id || null,
    }

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, ...payload })
      } else {
        await createProduct.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#2a2a2a] bg-[#1a1a1a] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {isEditing ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('form.editDescription') : t('form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] px-6">
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">{t('form.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                  className="border-[#2a2a2a] bg-[#0f0f0f]"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">{t('form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('form.descriptionPlaceholder')}
                  className="border-[#2a2a2a] bg-[#0f0f0f]"
                  rows={3}
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('form.category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as Product['category'] })
                    }
                  >
                    <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`categories.${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="brand">{t('form.brand')}</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder={t('form.brandPlaceholder')}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>
              </div>

              {/* Size & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="size">{t('form.size')}</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder={t('form.sizePlaceholder')}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t('form.condition')}</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                      <SelectValue placeholder={t('form.conditionPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                      {CONDITIONS.map((cond) => (
                        <SelectItem key={cond} value={cond}>
                          {t(`conditions.${cond}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Purchase Price & Purchase Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_price">{t('form.purchasePrice')}</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">{t('form.purchaseDate')}</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>
              </div>

              {/* Purchase Source & Listing Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_source">{t('form.purchaseSource')}</Label>
                  <Input
                    id="purchase_source"
                    value={formData.purchase_source}
                    onChange={(e) => setFormData({ ...formData, purchase_source: e.target.value })}
                    placeholder={t('form.purchaseSourcePlaceholder')}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="listing_price">{t('form.listingPrice')}</Label>
                  <Input
                    id="listing_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.listing_price}
                    onChange={(e) => setFormData({ ...formData, listing_price: e.target.value })}
                    placeholder="0.00"
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>
              </div>

              {/* Quantity & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">{t('form.quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t('form.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as Product['status'] })
                    }
                  >
                    <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`statuses.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SKU & Vinted URL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">{t('form.sku')}</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder={t('form.skuPlaceholder')}
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vinted_url">{t('form.vintedUrl')}</Label>
                  <Input
                    id="vinted_url"
                    value={formData.vinted_url}
                    onChange={(e) => setFormData({ ...formData, vinted_url: e.target.value })}
                    placeholder="https://www.vinted.fr/..."
                    className="border-[#2a2a2a] bg-[#0f0f0f]"
                  />
                </div>
              </div>

              {/* Folder */}
              <div className="grid gap-2">
                <Label>{t('form.folder')}</Label>
                <Select
                  value={formData.folder_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, folder_id: value === '_none' ? '' : value })
                  }
                >
                  <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                    <SelectValue placeholder={t('form.folderPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                    <SelectItem value="_none">{t('form.noFolder')}</SelectItem>
                    {folders?.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">{t('form.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('form.notesPlaceholder')}
                  className="border-[#2a2a2a] bg-[#0f0f0f]"
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] hover:bg-[#2a2a2a]"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || isPending}
              className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t('form.update') : t('form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
