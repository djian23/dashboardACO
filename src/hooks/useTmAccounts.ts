import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TmAccount } from '@/types'

export function useTmAccounts() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tm_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tm_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as TmAccount[]
    },
    enabled: !!user,
  })
}

export function useCreateTmAccount() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (account: Partial<TmAccount>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tm_accounts')
        .insert({ ...account, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as TmAccount
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tm_accounts'] })
    },
  })
}

export function useUpdateTmAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TmAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('tm_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as TmAccount
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tm_accounts'] })
    },
  })
}

export function useDeleteTmAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tm_accounts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tm_accounts'] })
    },
  })
}
