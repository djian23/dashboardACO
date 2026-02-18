import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Todo } from '@/types'
import { useCreateTodo, useUpdateTodo } from '@/hooks/useTodos'
import { useEvents } from '@/hooks/useEvents'
import { useProducts } from '@/hooks/useProducts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

interface TodoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: Todo
}

export function TodoFormModal({ open, onOpenChange, todo }: TodoFormModalProps) {
  const { t } = useTranslation('todos')
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const { data: events } = useEvents()
  const { data: products } = useProducts()

  const [eventSearch, setEventSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Todo['priority'],
    linked_event_id: '',
    linked_product_id: '',
  })

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description ?? '',
        due_date: todo.due_date ?? '',
        priority: todo.priority,
        linked_event_id: todo.linked_event_id ?? '',
        linked_product_id: todo.linked_product_id ?? '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        linked_event_id: '',
        linked_product_id: '',
      })
    }
    setEventSearch('')
    setProductSearch('')
  }, [todo, open])

  const isEditing = !!todo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
      priority: formData.priority,
      linked_event_id: formData.linked_event_id || null,
      linked_product_id: formData.linked_product_id || null,
    }

    if (isEditing) {
      await updateTodo.mutateAsync({ id: todo.id, ...payload })
    } else {
      await createTodo.mutateAsync(payload)
    }

    onOpenChange(false)
  }

  const filteredEvents = events?.filter((e) =>
    e.name.toLowerCase().includes(eventSearch.toLowerCase())
  ) ?? []

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ) ?? []

  const isPending = createTodo.isPending || updateTodo.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? t('editTask') : t('addTask')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing ? t('editTaskDescription') : t('addTaskDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              {t('taskTitle')}
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              placeholder={t('taskTitlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              {t('description')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-gray-300">
                {t('dueDate')}
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-300">
                {t('priority')}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Todo['priority']) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="low">{t('priority_low')}</SelectItem>
                  <SelectItem value="medium">
                    {t('priority_medium')}
                  </SelectItem>
                  <SelectItem value="high">{t('priority_high')}</SelectItem>
                  <SelectItem value="urgent">
                    {t('priority_urgent')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked event select with search */}
          <div className="space-y-2">
            <Label className="text-gray-300">{t('linkedEvent')}</Label>
            <Select
              value={formData.linked_event_id || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  linked_event_id: value === 'none' ? '' : value,
                }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder={t('selectEvent')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="px-2 pb-2">
                  <Input
                    placeholder={t('searchEvents')}
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="bg-[#0f0f0f] border-[#2a2a2a] text-white h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="none">{t('noLinkedEvent')}</SelectItem>
                {filteredEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked product select with search */}
          <div className="space-y-2">
            <Label className="text-gray-300">{t('linkedProduct')}</Label>
            <Select
              value={formData.linked_product_id || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  linked_product_id: value === 'none' ? '' : value,
                }))
              }
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue placeholder={t('selectProduct')} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="px-2 pb-2">
                  <Input
                    placeholder={t('searchProducts')}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-[#0f0f0f] border-[#2a2a2a] text-white h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="none">{t('noLinkedProduct')}</SelectItem>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              {isPending
                ? t('saving')
                : isEditing
                  ? t('save')
                  : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
