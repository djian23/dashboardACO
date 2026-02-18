import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal'
import { useCalendarEvents } from '@/hooks/useCalendarEvents'
import type { CalendarEvent } from '@/types'

export default function CalendarPage() {
  const { t } = useTranslation('calendar')

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { data } = useCalendarEvents(month, year)

  // Merge calendar events with regular events (converted to CalendarEvent shape)
  const allEvents = useMemo(() => {
    const calEvents = data?.calendarEvents ?? []
    const regularEvents = data?.events ?? []

    const eventsAsCalendar: CalendarEvent[] = regularEvents.map(
      (ev: { id: string; name: string; event_date: string; event_end_date: string | null; category: string; venue: string | null; city: string | null; status: string }) => ({
        id: `event-${ev.id}`,
        user_id: '',
        title: ev.name,
        description: `${ev.venue ?? ''} ${ev.city ?? ''}`.trim() || null,
        start_date: ev.event_date ?? '',
        end_date: ev.event_end_date ?? null,
        all_day: false,
        color:
          ev.category === 'concert'
            ? '#7c3aed'
            : ev.category === 'football'
              ? '#10b981'
              : ev.category === 'tennis'
                ? '#f59e0b'
                : ev.category === 'rugby'
                  ? '#ef4444'
                  : '#6366f1',
        category: 'event' as const,
        linked_event_id: ev.id,
        linked_product_id: null,
        recurrence_rule: null,
        created_at: '',
        updated_at: '',
      })
    )

    return [...calEvents, ...eventsAsCalendar]
  }, [data])

  const handleDateClick = (date: Date) => {
    setEditingEvent(null)
    setSelectedDate(date)
    setEventModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    // Only edit custom calendar events, not regular events
    if (event.id.startsWith('event-')) {
      // Clicking a regular event: switch to day view for that date
      setCurrentDate(new Date(event.start_date))
      setView('day')
      return
    }
    setEditingEvent(event)
    setSelectedDate(undefined)
    setEventModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t('title', 'Calendrier')}
        </h1>
      </div>

      {/* Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
      />

      {/* Calendar view */}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={allEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={allEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          events={allEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event modal */}
      <CalendarEventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={editingEvent}
        defaultDate={selectedDate}
      />
    </div>
  )
}
