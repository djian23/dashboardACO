import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Event } from '@/types'

interface EventFilters {
  folderId?: string
  category?: string
  status?: string
  search?: string
}

export function useEvents(filters?: EventFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*, ticket_lots(id, quantity, purchase_price_total, status), sales(id, sale_price_total, fees)')
        .order('event_date', { ascending: false })

      if (filters?.folderId) query = query.eq('folder_id', filters.folderId)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as Event[]
    },
    enabled: !!user,
  })
}

export function useEvent(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, ticket_lots(*, tm_account:tm_accounts(id, email, display_name), sales(*)), sales(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Event
    },
    enabled: !!user && !!id,
  })
}

export function useCreateEvent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: Partial<Event>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('events')
        .insert({ ...event, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Event
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
