import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

interface WeekViewProps {
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

export function WeekView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = new Date(currentDate)
    const dayOfWeek = start.getDay()
    // Monday = 1, adjust so Monday is first
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + diff)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentDate])

  const today = new Date()

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return events.filter((event) => event.start_date.startsWith(dateStr))
  }

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = new Date(event.start_date)
    const startHour = startDate.getHours()
    const startMinutes = startDate.getMinutes()

    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 3600000)
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000

    const top = ((startHour - 8) * 60 + startMinutes) / 60 * 60 // 60px per hour
    const height = Math.max((durationMinutes / 60) * 60, 24) // minimum 24px

    return { top, height }
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#2a2a2a]">
        <div className="border-r border-[#2a2a2a]" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'py-3 text-center border-r border-[#2a2a2a] last:border-r-0',
              isToday(day) && 'bg-[#7c3aed]/10'
            )}
          >
            <p className="text-xs text-gray-500 uppercase">
              {format(day, 'EEE', { locale: fr })}
            </p>
            <p
              className={cn(
                'text-lg font-semibold mt-0.5',
                isToday(day) ? 'text-[#7c3aed]' : 'text-white'
              )}
            >
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {/* Time labels */}
          <div className="border-r border-[#2a2a2a]">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] flex items-start justify-end pr-2 pt-0.5"
              >
                <span className="text-[10px] text-gray-500">{`${String(hour).padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day).filter(
              (e) => !e.all_day
            )
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'relative border-r border-[#2a2a2a] last:border-r-0',
                  isToday(day) && 'bg-[#7c3aed]/5'
                )}
                onClick={() => onDateClick(day)}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-[#2a2a2a]/50"
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const pos = getEventPosition(event)
                  const color =
                    event.color || CATEGORY_COLORS[event.category] || '#7c3aed'
                  return (
                    <button
                      key={event.id}
                      className="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-white overflow-hidden cursor-pointer z-10"
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
                      <p className="truncate">{event.title}</p>
                      <p className="truncate opacity-75">
                        {format(new Date(event.start_date), 'HH:mm')}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
