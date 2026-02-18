import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateEvent, useUpdateEvent } from '@/hooks/useEvents'
import { useFolders } from '@/hooks/useFolders'
import type { Event } from '@/types'
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

interface EventFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event
}

export function EventFormModal({ open, onOpenChange, event }: EventFormModalProps) {
  const { t } = useTranslation('events')
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const { data: folders } = useFolders()

  const isEdit = !!event

  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState<Event['category']>('concert')
  const [status, setStatus] = useState<Event['status']>('upcoming')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setName(event.name)
      setEventDate(event.event_date?.slice(0, 10) ?? '')
      setEventEndDate(event.event_end_date?.slice(0, 10) ?? '')
      setVenue(event.venue ?? '')
      setCity(event.city ?? '')
      setCountry(event.country ?? '')
      setCategory(event.category)
      setStatus(event.status)
      setDescription(event.description ?? '')
      setNotes(event.notes ?? '')
      setFolderId(event.folder_id ?? '')
    } else {
      setName('')
      setEventDate('')
      setEventEndDate('')
      setVenue('')
      setCity('')
      setCountry('')
      setCategory('concert')
      setStatus('upcoming')
      setDescription('')
      setNotes('')
      setFolderId('')
      setError('')
    }
  }, [event, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('form.nameRequired'))
      return
    }

    const payload: Partial<Event> = {
      name: name.trim(),
      event_date: eventDate || null,
      event_end_date: eventEndDate || null,
      venue: venue.trim() || null,
      city: city.trim() || null,
      country: country.trim() || 'FR',
      category,
      status,
      description: description.trim() || null,
      notes: notes.trim() || null,
      folder_id: folderId || null,
    }

    try {
      if (isEdit && event) {
        await updateEvent.mutateAsync({ id: event.id, ...payload })
      } else {
        await createEvent.mutateAsync(payload)
      }
      onOpenChange(false)
    } catch {
      setError(t('form.error'))
    }
  }

  const isLoading = createEvent.isPending || updateEvent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#2a2a2a] bg-[#1a1a1a] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEdit ? t('form.editDescription') : t('form.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event-name">{t('form.name')} *</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.namePlaceholder')}
                required
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">{t('form.eventDate')}</Label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-end-date">{t('form.eventEndDate')}</Label>
              <Input
                id="event-end-date"
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-venue">{t('form.venue')}</Label>
              <Input
                id="event-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder={t('form.venuePlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-city">{t('form.city')}</Label>
              <Input
                id="event-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('form.cityPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-country">{t('form.country')}</Label>
              <Input
                id="event-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t('form.countryPlaceholder')}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('form.category')}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Event['category'])}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="concert">{t('categories.concert')}</SelectItem>
                  <SelectItem value="football">{t('categories.football')}</SelectItem>
                  <SelectItem value="tennis">{t('categories.tennis')}</SelectItem>
                  <SelectItem value="rugby">{t('categories.rugby')}</SelectItem>
                  <SelectItem value="other">{t('categories.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('form.status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Event['status'])}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="upcoming">{t('statuses.upcoming')}</SelectItem>
                  <SelectItem value="ongoing">{t('statuses.ongoing')}</SelectItem>
                  <SelectItem value="completed">{t('statuses.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('statuses.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('form.folder')}</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger className="border-[#2a2a2a] bg-[#0f0f0f]">
                  <SelectValue placeholder={t('form.folderPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#1a1a1a]">
                  <SelectItem value="none">{t('form.noFolder')}</SelectItem>
                  {folders?.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        {folder.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event-description">{t('form.description')}</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="event-notes">{t('form.notes')}</Label>
              <Textarea
                id="event-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('form.notesPlaceholder')}
                rows={2}
                className="border-[#2a2a2a] bg-[#0f0f0f]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#2a2a2a]"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#7c3aed] hover:bg-[#7c3aed]/90"
            >
              {isLoading
                ? t('form.saving')
                : isEdit
                  ? t('form.update')
                  : t('form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
