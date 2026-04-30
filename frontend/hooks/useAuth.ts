import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/services/auth.service'
import { User } from '@/types'

export function useAuth() {
  const { user, accessToken, setUser, logout } = useAuthStore()

  const { isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await AuthService.getMe()
      setUser(data)
      return data
    },
    enabled: !!accessToken && !user,
    retry: false,
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!accessToken,
    logout,
  }
}

export function useAuthCallback() {
  const { setTokens, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({ access, refresh }: { access: string; refresh: string }) => {
      setTokens(access, refresh)
      const data = await AuthService.getMeWithToken(access)
      setUser(data)
      return data
    },
  })
}

export function useSetRole() {
  const { setTokens, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async (role: 'user' | 'creator') => {
      const tokens = await AuthService.setRole(role)
      setTokens(tokens.access, tokens.refresh)
      const user = await AuthService.getMeWithToken(tokens.access)
      setUser(user)
      return { role, user }
    },
  })
}
