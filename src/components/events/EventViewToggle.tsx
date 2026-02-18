import { LayoutList, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EventViewToggleProps {
  view: 'list' | 'card'
  onViewChange: (view: 'list' | 'card') => void
}

export function EventViewToggle({ view, onViewChange }: EventViewToggleProps) {
  return (
    <div className="flex items-center rounded-md border border-[#2a2a2a] bg-[#0f0f0f] p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-7 w-7 rounded-sm',
          view === 'list'
            ? 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 hover:text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('card')}
        className={cn(
          'h-7 w-7 rounded-sm',
          view === 'card'
            ? 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90 hover:text-white'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  )
}
