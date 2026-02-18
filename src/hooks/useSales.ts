import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Sale } from '@/types'

export function useSales(filters?: { ticketLotId?: string; productId?: string }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*, ticket_lot:ticket_lots(id, section, row, event:events(id, name)), product:products(id, name)')
        .order('sale_date', { ascending: false })

      if (filters?.ticketLotId) query = query.eq('ticket_lot_id', filters.ticketLotId)
      if (filters?.productId) query = query.eq('product_id', filters.productId)

      const { data, error } = await query
      if (error) throw error
      return data as Sale[]
    },
    enabled: !!user,
  })
}

export function useCreateSale() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sale: Partial<Sale>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('sales')
        .insert({ ...sale, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Sale
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['ticket_lots'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
    },
  })
}

export function useUpdateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sale> & { id: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Sale
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['ticket_lots'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
    },
  })
}
