'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthCallback } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authCallback = useAuthCallback()

  useEffect(() => {
    const access = searchParams.get('access')
    const refresh = searchParams.get('refresh')

    if (!access || !refresh) {
      toast.error('Authentication failed')
      router.replace('/')
      return
    }

    authCallback.mutate(
      { access, refresh },
      {
        onSuccess: (user) => {
          if (!user.role) {
            router.replace('/select-role')
          } else {
            toast.success(`Welcome back, ${user.name || user.email}!`)
            router.replace(user.role === 'creator' ? '/creator' : '/')
          }
        },
        onError: () => {
          toast.error('Failed to load profile')
          router.replace('/')
        },
      }
    )
  }, [])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-slate-400" />
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
