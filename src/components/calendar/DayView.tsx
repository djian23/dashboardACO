import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 8am to 10pm

const CATEGORY_COLORS: Record<string, string> = {
  event: '#7c3aed',
  deadline: '#ef4444',
  billetterie: '#f59e0b',
  reminder: '#3b82f6',
  other: '#9ca3af',
}

export function DayView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: DayViewProps) {
  const dayEvents = useMemo(() => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    return events.filter((event) => event.start_date.startsWith(dateStr))
  }, [currentDate, events])

  const allDayEvents = dayEvents.filter((e) => e.all_day)
  const timedEvents = dayEvents.filter((e) => !e.all_day)

  const today = new Date()
  const isToday =
    currentDate.getDate() === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear()

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = new Date(event.start_date)
    const startHour = startDate.getHours()
    const startMinutes = startDate.getMinutes()

    const endDate = event.end_date
      ? new Date(event.end_date)
      : new Date(startDate.getTime() + 3600000)
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000

    const top = ((startHour - 8) * 60 + startMinutes) / 60 * 64 // 64px per hour
    const height = Math.max((durationMinutes / 60) * 64, 28)

    return { top, height }
  }

  // Current time indicator
  const currentTimePosition = useMemo(() => {
    if (!isToday) return null
    const now = new Date()
    const hour = now.getHours()
    const minutes = now.getMinutes()
    if (hour < 8 || hour > 22) return null
    return ((hour - 8) * 60 + minutes) / 60 * 64
  }, [isToday])

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b border-[#2a2a2a] text-center">
        <p className="text-sm text-gray-500 uppercase">
          {format(currentDate, 'EEEE', { locale: fr })}
        </p>
        <p
          className={cn(
            'text-3xl font-bold mt-1',
            isToday ? 'text-[#7c3aed]' : 'text-white'
          )}
        >
          {currentDate.getDate()}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-2 border-b border-[#2a2a2a] space-y-1">
          <p className="text-[10px] text-gray-500 uppercase font-medium px-1">
            Toute la journee
          </p>
          {allDayEvents.map((event) => {
            const color =
              event.color || CATEGORY_COLORS[event.category] || '#7c3aed'
            return (
              <button
                key={event.id}
                className="w-full text-left rounded px-2 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
                onClick={() => onEventClick(event)}
              >
                {event.title}
              </button>
            )
          })}
        </div>
      )}

      {/* Time grid */}
      <div
        className="overflow-y-auto max-h-[600px]"
        onClick={() => onDateClick(currentDate)}
      >
        <div className="grid grid-cols-[60px_1fr] relative">
          {/* Time labels */}
          <div className="border-r border-[#2a2a2a]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[64px] flex items-start justify-end pr-2 pt-0.5"
              >
                <span className="text-[10px] text-gray-500">
                  {`${String(hour).padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[64px] border-b border-[#2a2a2a]/50"
              />
            ))}

            {/* Current time indicator */}
            {currentTimePosition != null && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 h-px bg-red-500" />
              </div>
            )}

            {/* Events */}
            {timedEvents.map((event) => {
              const pos = getEventPosition(event)
              const color =
                event.color || CATEGORY_COLORS[event.category] || '#7c3aed'
              return (
                <button
                  key={event.id}
                  className="absolute left-1 right-1 rounded-lg px-3 py-1.5 text-white overflow-hidden cursor-pointer z-10"
                  style={{
                    top: `${pos.top}px`,
                    height: `${pos.height}px`,
                    backgroundColor: color,
                    opacity: 0.9,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                >
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs opacity-75">
                    {format(new Date(event.start_date), 'HH:mm')}
                    {event.end_date &&
                      ` - ${format(new Date(event.end_date), 'HH:mm')}`}
                  </p>
                  {event.description && (
                    <p className="text-xs opacity-60 truncate mt-0.5">
                      {event.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
