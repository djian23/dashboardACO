import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Product } from '@/types'

interface ProductFilters {
  folderId?: string
  category?: string
  status?: string
  search?: string
}

export function useProducts(filters?: ProductFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, sales(id, sale_price_total, fees)')
        .order('created_at', { ascending: false })

      if (filters?.folderId) query = query.eq('folder_id', filters.folderId)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
    enabled: !!user,
  })
}

export function useProduct(id: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, sales(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!user && !!id,
  })
}

export function useCreateProduct() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('products')
        .insert({ ...product, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
