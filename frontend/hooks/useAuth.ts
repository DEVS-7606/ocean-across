import { useQuery } from '@tanstack/react-query'
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
