import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TreasuryEntry } from '@/types'

interface TreasuryFilters {
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
}

export function useTreasuryEntries(filters?: TreasuryFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['treasury', filters],
    queryFn: async () => {
      let query = supabase
        .from('treasury_entries')
        .select('*')
        .order('entry_date', { ascending: false })

      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.startDate) query = query.gte('entry_date', filters.startDate)
      if (filters?.endDate) query = query.lte('entry_date', filters.endDate)

      const { data, error } = await query
      if (error) throw error
      return data as TreasuryEntry[]
    },
    enabled: !!user,
  })
}

export function useTreasuryBalance() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['treasury', 'balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treasury_entries')
        .select('type, amount')

      if (error) throw error

      const entries = data as Pick<TreasuryEntry, 'type' | 'amount'>[]
      const totalIncome = entries
        .filter((e) => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0)
      const totalExpenses = entries
        .filter((e) => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      }
    },
    enabled: !!user,
  })
}

export function useCreateTreasuryEntry() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: Partial<TreasuryEntry>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('treasury_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as TreasuryEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTreasuryEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreasuryEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('treasury_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as TreasuryEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTreasuryEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treasury_entries')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
