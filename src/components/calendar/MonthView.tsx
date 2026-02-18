import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const CATEGORY_COLORS: Record<string, string> = {
  event: 'bg-[#7c3aed]',
  deadline: 'bg-red-500',
  billetterie: 'bg-amber-500',
  reminder: 'bg-blue-500',
  other: 'bg-gray-400',
}

export function MonthView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: MonthViewProps) {
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Monday = 0, Sunday = 6
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6

    const days: {
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
    }[] = []

    // Days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, isCurrentMonth: false, isToday: false })
    }

    // Days of current month
    const today = new Date()
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i)
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      days.push({ date: d, isCurrentMonth: true, isToday })
    }

    // Fill remaining cells to complete grid (always 42 cells = 6 rows)
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, isCurrentMonth: false, isToday: false })
    }

    return days
  }, [currentDate])

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return events.filter((event) => event.start_date.startsWith(dateStr))
  }

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[#2a2a2a]">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-3 text-center text-xs font-medium text-gray-500 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)
          return (
            <div
              key={index}
              className={cn(
                'min-h-[100px] border-b border-r border-[#2a2a2a] p-1.5 cursor-pointer transition-colors hover:bg-[#2a2a2a]/50',
                !day.isCurrentMonth && 'bg-[#0f0f0f]/50'
              )}
              onClick={() => onDateClick(day.date)}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                    day.isToday
                      ? 'bg-[#7c3aed] text-white font-bold ring-2 ring-[#7c3aed]/50'
                      : day.isCurrentMonth
                        ? 'text-gray-300'
                        : 'text-gray-600'
                  )}
                >
                  {day.date.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    className={cn(
                      'w-full text-left rounded px-1.5 py-0.5 text-[10px] font-medium truncate',
                      event.color
                        ? `text-white`
                        : 'text-white',
                      CATEGORY_COLORS[event.category] ?? 'bg-[#7c3aed]'
                    )}
                    style={event.color ? { backgroundColor: event.color } : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-gray-500 px-1">
                    +{dayEvents.length - 3} de plus
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
