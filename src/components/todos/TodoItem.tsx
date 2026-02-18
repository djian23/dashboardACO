import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, Calendar, Tag } from 'lucide-react'
import type { Todo } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, isCompleted: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

const priorityStyles: Record<Todo['priority'], string> = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const { t } = useTranslation('todos')

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    if (dateOnly.getTime() === today.getTime()) return t('today')
    if (dateOnly.getTime() === tomorrow.getTime()) return t('tomorrow')

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isOverdue =
    todo.due_date &&
    !todo.is_completed &&
    new Date(todo.due_date) < new Date(new Date().toISOString().split('T')[0])

  const linkedName =
    todo.linked_event?.name ?? todo.linked_product?.name ?? null
  const linkedType = todo.linked_event ? 'event' : todo.linked_product ? 'product' : null

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors">
      {/* Checkbox */}
      <Checkbox
        checked={todo.is_completed}
        onCheckedChange={(checked) => onToggle(todo.id, !!checked)}
        className="mt-1 border-[#2a2a2a] data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed]"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              todo.is_completed
                ? 'line-through text-gray-500'
                : 'text-white'
            }`}
          >
            {todo.title}
          </span>
          <Badge className={priorityStyles[todo.priority]}>
            {t(`priority_${todo.priority}`)}
          </Badge>
        </div>

        {todo.description && (
          <p
            className={`text-xs line-clamp-1 ${
              todo.is_completed ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {todo.description}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {todo.due_date && (
            <div
              className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-400' : 'text-gray-500'
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>{formatDate(todo.due_date)}</span>
            </div>
          )}

          {linkedName && linkedType && (
            <div className="flex items-center gap-1 text-xs text-[#7c3aed]">
              <Tag className="h-3 w-3" />
              <span>{linkedName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(todo)}
          className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] h-8 w-8 p-0"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo)}
          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
