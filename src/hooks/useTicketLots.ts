import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TicketLot } from '@/types'

export function useTicketLots(eventId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['ticket_lots', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_lots')
        .select('*, tm_account:tm_accounts(id, email, display_name), sales(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as TicketLot[]
    },
    enabled: !!user && !!eventId,
  })
}

export function useCreateTicketLot() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lot: Partial<TicketLot>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('ticket_lots')
        .insert({ ...lot, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as TicketLot
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket_lots', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTicketLot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TicketLot> & { id: string }) => {
      const { data, error } = await supabase
        .from('ticket_lots')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as TicketLot
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket_lots', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteTicketLot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase
        .from('ticket_lots')
        .delete()
        .eq('id', id)
      if (error) throw error
      return { eventId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket_lots', data.eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
