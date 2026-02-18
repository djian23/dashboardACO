import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CalendarToolbarProps {
  currentDate: Date
  view: string
  onDateChange: (date: Date) => void
  onViewChange: (view: 'month' | 'week' | 'day') => void
}

export function CalendarToolbar({
  currentDate,
  view,
  onDateChange,
  onViewChange,
}: CalendarToolbarProps) {
  const navigatePrev = () => {
    const d = new Date(currentDate)
    if (view === 'month') {
      d.setMonth(d.getMonth() - 1)
    } else if (view === 'week') {
      d.setDate(d.getDate() - 7)
    } else {
      d.setDate(d.getDate() - 1)
    }
    onDateChange(d)
  }

  const navigateNext = () => {
    const d = new Date(currentDate)
    if (view === 'month') {
      d.setMonth(d.getMonth() + 1)
    } else if (view === 'week') {
      d.setDate(d.getDate() + 7)
    } else {
      d.setDate(d.getDate() + 1)
    }
    onDateChange(d)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: fr })
    }
    if (view === 'week') {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay() + 1)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`
    }
    return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
        >
          Aujourd'hui
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={navigatePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={navigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold text-white capitalize">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] p-1">
        {(['month', 'week', 'day'] as const).map((v) => (
          <Button
            key={v}
            variant="ghost"
            size="sm"
            className={
              view === v
                ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }
            onClick={() => onViewChange(v)}
          >
            {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
          </Button>
        ))}
      </div>
    </div>
  )
}
