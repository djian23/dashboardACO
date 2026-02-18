import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { CalendarEvent } from '@/types'

export function useCalendarEvents(month: number, year: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['calendar_events', month, year],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

      // Fetch custom calendar events for the month
      const { data: calendarEvents, error: calError } = await supabase
        .from('calendar_events')
        .select('*, linked_event:events(id, name, event_date), linked_product:products(id, name)')
        .gte('start_date', startDate)
        .lte('start_date', endDate)
        .order('start_date', { ascending: true })

      if (calError) throw calError

      // Fetch events (concerts, etc.) happening in this month
      const { data: events, error: evError } = await supabase
        .from('events')
        .select('id, name, event_date, event_end_date, category, venue, city, status')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true })

      if (evError) throw evError

      return {
        calendarEvents: calendarEvents as CalendarEvent[],
        events: events ?? [],
      }
    },
    enabled: !!user,
  })
}

export function useCreateCalendarEvent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({ ...event, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
    },
  })
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
    },
  })
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
    },
  })
}
