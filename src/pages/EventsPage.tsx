import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Calendar } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FolderSidebar } from '@/components/events/FolderSidebar'
import { EventFilters } from '@/components/events/EventFilters'
import { EventViewToggle } from '@/components/events/EventViewToggle'
import { EventList } from '@/components/events/EventList'
import { EventCard } from '@/components/events/EventCard'
import { EventFormModal } from '@/components/events/EventFormModal'

interface EventFiltersState {
  search?: string
  category?: string
  status?: string
  folderId?: string
}

export default function EventsPage() {
  const { t } = useTranslation('events')

  const [view, setView] = useState<'list' | 'card'>('list')
  const [filters, setFilters] = useState<EventFiltersState>({})
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const mergedFilters = {
    ...filters,
    folderId: selectedFolderId ?? filters.folderId,
  }

  const { data: events, isLoading } = useEvents(mergedFilters)

  const handleFolderSelect = (folderId?: string) => {
    setSelectedFolderId(folderId)
    setFilters((prev) => ({ ...prev, folderId: undefined }))
  }

  return (
    <div className="flex h-full min-h-screen bg-[#0f0f0f]">
      {/* Folder sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <FolderSidebar
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('page.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <EventViewToggle view={view} onViewChange={setView} />
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('page.addEvent')}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <EventFilters filters={filters} onFiltersChange={setFilters} />

          {/* Content */}
          {isLoading ? (
            <LoadingSkeleton view={view} />
          ) : !events || events.length === 0 ? (
            <EmptyState onAdd={() => setCreateModalOpen(true)} />
          ) : view === 'list' ? (
            <EventList events={events} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create event modal */}
      <EventFormModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation('events')

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-16">
      <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-1 text-lg font-semibold">{t('empty.title')}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{t('empty.description')}</p>
      <Button
        onClick={onAdd}
        className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        {t('page.addEvent')}
      </Button>
    </div>
  )
}

function LoadingSkeleton({ view }: { view: 'list' | 'card' }) {
  if (view === 'list') {
    return (
      <div className="space-y-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
      ))}
    </div>
  )
}
