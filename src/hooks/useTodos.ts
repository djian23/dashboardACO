import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Todo } from '@/types'

export function useTodos(filter?: 'all' | 'today' | 'upcoming' | 'completed') {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['todos', filter],
    queryFn: async () => {
      let query = supabase
        .from('todos')
        .select('*, linked_event:events(id, name), linked_product:products(id, name)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        query = query.eq('due_date', today).eq('is_completed', false)
      } else if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0]
        query = query.gt('due_date', today).eq('is_completed', false)
      } else if (filter === 'completed') {
        query = query.eq('is_completed', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Todo[]
    },
    enabled: !!user,
  })
}

export function useCreateTodo() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todo: Partial<Todo>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('todos')
        .insert({ ...todo, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Todo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
