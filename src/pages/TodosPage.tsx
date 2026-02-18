import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, CheckSquare } from 'lucide-react'
import type { Todo } from '@/types'
import { useTodos, useToggleTodo, useDeleteTodo } from '@/hooks/useTodos'
import { TodoItem } from '@/components/todos/TodoItem'
import { TodoFormModal } from '@/components/todos/TodoFormModal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

export default function TodosPage() {
  const { t } = useTranslation('todos')

  const [activeTab, setActiveTab] = useState<
    'all' | 'today' | 'upcoming' | 'completed'
  >('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)

  const { data: todos, isLoading } = useTodos(activeTab)
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()

  const handleToggle = (id: string, isCompleted: boolean) => {
    toggleTodo.mutate({ id, isCompleted })
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingTodo(undefined)
  }

  const confirmDelete = async () => {
    if (deletingTodo) {
      await deleteTodo.mutateAsync(deletingTodo.id)
      setDeletingTodo(null)
    }
  }

  const emptyMessages: Record<string, { title: string; description: string }> = {
    all: { title: t('emptyAllTitle'), description: t('emptyAllDescription') },
    today: {
      title: t('emptyTodayTitle'),
      description: t('emptyTodayDescription'),
    },
    upcoming: {
      title: t('emptyUpcomingTitle'),
      description: t('emptyUpcomingDescription'),
    },
    completed: {
      title: t('emptyCompletedTitle'),
      description: t('emptyCompletedDescription'),
    },
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addTask')}
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'all' | 'today' | 'upcoming' | 'completed')
        }
      >
        <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a]">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabAll')}
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabToday')}
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabUpcoming')}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white text-gray-400"
          >
            {t('tabCompleted')}
          </TabsTrigger>
        </TabsList>

        {['all', 'today', 'upcoming', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {/* Loading */}
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && todos && todos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckSquare className="h-12 w-12 text-gray-600 mb-4" />
                <h2 className="text-lg font-semibold text-white mb-2">
                  {emptyMessages[tab].title}
                </h2>
                <p className="text-gray-400 text-sm max-w-md">
                  {emptyMessages[tab].description}
                </p>
              </div>
            )}

            {/* Todo list */}
            {!isLoading && todos && todos.length > 0 && (
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] divide-y divide-[#2a2a2a]">
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={setDeletingTodo}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Form modal */}
      <TodoFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        todo={editingTodo}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!deletingTodo}
        onOpenChange={(open) => !open && setDeletingTodo(null)}
      >
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('confirmDeleteTitle')}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('confirmDeleteDescription', {
                title: deletingTodo?.title,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTodo(null)}
              className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTodo.isPending}
            >
              {deleteTodo.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
