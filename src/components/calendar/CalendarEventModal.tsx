import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Trash2 } from 'lucide-react'
import {
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '@/hooks/useCalendarEvents'
import type { CalendarEvent } from '@/types'

interface CalendarEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: CalendarEvent | null
  defaultDate?: Date
}

const COLOR_OPTIONS = [
  '#7c3aed',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#6366f1',
]

export function CalendarEventModal({
  open,
  onOpenChange,
  event,
  defaultDate,
}: CalendarEventModalProps) {
  const isEditing = !!event

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState('#7c3aed')
  const [category, setCategory] = useState<CalendarEvent['category']>('event')
  const [linkedEventId, setLinkedEventId] = useState('')
  const [linkedProductId, setLinkedProductId] = useState('')

  const createEvent = useCreateCalendarEvent()
  const updateEvent = useUpdateCalendarEvent()
  const deleteEvent = useDeleteCalendarEvent()

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description ?? '')
      const startDt = new Date(event.start_date)
      setStartDate(event.start_date.split('T')[0])
      setStartTime(
        `${String(startDt.getHours()).padStart(2, '0')}:${String(startDt.getMinutes()).padStart(2, '0')}`
      )
      if (event.end_date) {
        const endDt = new Date(event.end_date)
        setEndDate(event.end_date.split('T')[0])
        setEndTime(
          `${String(endDt.getHours()).padStart(2, '0')}:${String(endDt.getMinutes()).padStart(2, '0')}`
        )
      } else {
        setEndDate('')
        setEndTime('10:00')
      }
      setAllDay(event.all_day)
      setColor(event.color || '#7c3aed')
      setCategory(event.category)
      setLinkedEventId(event.linked_event_id ?? '')
      setLinkedProductId(event.linked_product_id ?? '')
    } else {
      setTitle('')
      setDescription('')
      const d = defaultDate ?? new Date()
      setStartDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      )
      setStartTime('09:00')
      setEndDate('')
      setEndTime('10:00')
      setAllDay(false)
      setColor('#7c3aed')
      setCategory('event')
      setLinkedEventId('')
      setLinkedProductId('')
    }
  }, [event, defaultDate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startIso = allDay
      ? `${startDate}T00:00:00`
      : `${startDate}T${startTime}:00`

    let endIso: string | null = null
    if (endDate) {
      endIso = allDay
        ? `${endDate}T23:59:59`
        : `${endDate}T${endTime}:00`
    } else if (!allDay) {
      endIso = `${startDate}T${endTime}:00`
    }

    const data = {
      title,
      description: description || null,
      start_date: startIso,
      end_date: endIso,
      all_day: allDay,
      color,
      category,
      linked_event_id: linkedEventId || null,
      linked_product_id: linkedProductId || null,
    }

    if (isEditing && event) {
      updateEvent.mutate(
        { id: event.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createEvent.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  const handleDelete = () => {
    if (!event) return
    deleteEvent.mutate(event.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  const isPending =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Modifier l\'evenement' : 'Nouvel evenement'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? 'Modifiez les details de cet evenement.'
              : 'Ajoutez un nouvel evenement a votre calendrier.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-gray-300">Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'evenement"
              required
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white resize-none"
              rows={2}
            />
          </div>

          {/* All day switch */}
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Toute la journee</Label>
            <Switch checked={allDay} onCheckedChange={setAllDay} />
          </div>

          {/* Start date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Date de debut</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label className="text-gray-300">Heure de debut</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                />
              </div>
            )}
          </div>

          {/* End date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300">Date de fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label className="text-gray-300">Heure de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
                />
              </div>
            )}
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-gray-300">Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-7 w-7 rounded-full transition-all ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-gray-300">Categorie</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as CalendarEvent['category'])}
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="event" className="text-white">Evenement</SelectItem>
                <SelectItem value="deadline" className="text-white">Echeance</SelectItem>
                <SelectItem value="billetterie" className="text-white">Billetterie</SelectItem>
                <SelectItem value="reminder" className="text-white">Rappel</SelectItem>
                <SelectItem value="other" className="text-white">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Linked IDs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Evenement lie (ID)</Label>
              <Input
                value={linkedEventId}
                onChange={(e) => setLinkedEventId(e.target.value)}
                placeholder="UUID optionnel"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">Produit lie (ID)</Label>
              <Input
                value={linkedProductId}
                onChange={(e) => setLinkedProductId(e.target.value)}
                placeholder="UUID optionnel"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#2a2a2a] text-gray-400 hover:text-white"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
              >
                {isPending
                  ? 'Enregistrement...'
                  : isEditing
                    ? 'Modifier'
                    : 'Creer'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
