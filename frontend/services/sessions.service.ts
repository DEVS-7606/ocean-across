import api from '@/lib/api'
import { Session } from '@/types'

function toFormData(data: Record<string, any>): FormData {
  const fd = new FormData()
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null && val !== '') fd.append(key, val)
  }
  return fd
}

export const SessionsService = {
  getCatalog: (search = ''): Promise<Session[]> =>
    api.get(`/sessions/${search ? `?search=${search}` : ''}`).then((r) => r.data),

  getById: (id: number | string): Promise<Session> =>
    api.get(`/sessions/${id}/`).then((r) => r.data),

  getCreatorSessions: (): Promise<Session[]> =>
    api.get('/sessions/creator/').then((r) => r.data),

  create: (payload: Record<string, any>): Promise<Session> =>
    api.post('/sessions/creator/', toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: number, payload: Record<string, any>): Promise<Session> =>
    api.patch(`/sessions/creator/${id}/`, toFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/sessions/creator/${id}/`).then((r) => r.data),
}
