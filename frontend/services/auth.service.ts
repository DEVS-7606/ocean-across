import api from '@/lib/api'
import { User } from '@/types'

export const AuthService = {
  getMe: (): Promise<User> =>
    api.get('/auth/me/').then((r) => r.data),

  getMeWithToken: (token: string): Promise<User> =>
    api.get('/auth/me/', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data),

  updateProfile: (data: Pick<User, 'name' | 'avatar_url'>): Promise<User> =>
    api.patch('/auth/profile/', data).then((r) => r.data),

  setRole: (role: 'user' | 'creator'): Promise<{ role: string; access: string; refresh: string }> =>
    api.post('/auth/role/', { role }).then((r) => r.data),

  logout: (refreshToken: string): Promise<void> =>
    api.post('/auth/logout/', { refresh: refreshToken }).then((r) => r.data),
}
