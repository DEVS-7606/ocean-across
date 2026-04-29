import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SessionsService } from '@/services/sessions.service'
import { Session } from '@/types'

export function useSessionCatalog(search = '') {
  return useQuery<Session[]>({
    queryKey: ['sessions', search],
    queryFn: () => SessionsService.getCatalog(search),
  })
}

export function useSession(id: number | string) {
  return useQuery<Session>({
    queryKey: ['session', id],
    queryFn: () => SessionsService.getById(id),
  })
}

export function useCreatorSessions() {
  return useQuery<Session[]>({
    queryKey: ['creator-sessions'],
    queryFn: SessionsService.getCreatorSessions,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Session>) => SessionsService.create(data),
    onSuccess: () => {
      toast.success('Session created')
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] })
    },
    onError: () => toast.error('Failed to create session'),
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Session> }) =>
      SessionsService.update(id, data),
    onSuccess: () => {
      toast.success('Session updated')
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] })
    },
    onError: () => toast.error('Failed to update session'),
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => SessionsService.delete(id),
    onSuccess: () => {
      toast.success('Session deleted')
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] })
    },
    onError: () => toast.error('Failed to delete session'),
  })
}
