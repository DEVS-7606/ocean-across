import api from '@/lib/api'
import { Session } from '@/types'

export const SessionsService = {
  getCatalog: (search = ''): Promise<Session[]> =>
    api.get(`/sessions/${search ? `?search=${search}` : ''}`).then((r) => r.data),

  getById: (id: number | string): Promise<Session> =>
    api.get(`/sessions/${id}/`).then((r) => r.data),

  getCreatorSessions: (): Promise<Session[]> =>
    api.get('/sessions/creator/').then((r) => r.data),

  create: (payload: Partial<Session>): Promise<Session> =>
    api.post('/sessions/creator/', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Session>): Promise<Session> =>
    api.patch(`/sessions/creator/${id}/`, payload).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/sessions/creator/${id}/`).then((r) => r.data),
}
