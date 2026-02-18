import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Invoice } from '@/types'

interface InvoiceFilters {
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}

export function useInvoices(filters?: InvoiceFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.startDate) query = query.gte('issue_date', filters.startDate)
      if (filters?.endDate) query = query.lte('issue_date', filters.endDate)
      if (filters?.search) query = query.or(`invoice_number.ilike.%${filters.search}%,buyer_name.ilike.%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as Invoice[]
    },
    enabled: !!user,
  })
}

export function useInvoice(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Invoice
    },
    enabled: !!user && !!id,
  })
}

export function useCreateInvoice() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...invoice, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Invoice
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
