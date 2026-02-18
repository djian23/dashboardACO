import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Parcel } from '@/types'

interface ParcelFilters {
  status?: string
  carrier?: string
  search?: string
}

export function detectCarrier(trackingNumber: string): string {
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingNumber)) return 'La Poste'
  if (/^\d{12,15}$/.test(trackingNumber)) return 'Colissimo'
  if (/^1Z[A-Z0-9]{16}$/.test(trackingNumber)) return 'UPS'
  if (/^\d{12,22}$/.test(trackingNumber)) return 'FedEx'
  if (/^\d{10,11}$/.test(trackingNumber)) return 'DHL'
  if (/^\d{8}$/.test(trackingNumber)) return 'Mondial Relay'
  return 'Autre'
}

export function useParcels(filters?: ParcelFilters) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['parcels', filters],
    queryFn: async () => {
      let query = supabase
        .from('parcels')
        .select('*, linked_sale:sales(id, buyer_name, sale_price_total), linked_event:events(id, name), linked_product:products(id, name)')
        .order('created_at', { ascending: false })

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.carrier) query = query.eq('carrier', filters.carrier)
      if (filters?.search) query = query.or(`tracking_number.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as Parcel[]
    },
    enabled: !!user,
  })
}

export function useCreateParcel() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (parcel: Partial<Parcel>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('parcels')
        .insert({ ...parcel, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Parcel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    },
  })
}

export function useUpdateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Parcel> & { id: string }) => {
      const { data, error } = await supabase
        .from('parcels')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Parcel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    },
  })
}

export function useDeleteParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('parcels')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    },
  })
}
