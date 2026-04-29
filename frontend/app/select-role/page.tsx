'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, BookOpen, Sparkles } from 'lucide-react'

function SelectRoleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokens, setUser } = useAuthStore()
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const access = searchParams.get('access')
    const refresh = searchParams.get('refresh')
    if (access && refresh) setTokens(access, refresh)
  }, [])

  const handleSelectRole = async (role: 'user' | 'creator') => {
    setLoading(role)
    try {
      const { data } = await api.post('/auth/role/', { role })
      setTokens(data.access, data.refresh)
      const meRes = await api.get('/auth/me/', {
        headers: { Authorization: `Bearer ${data.access}` },
      })
      setUser(meRes.data)
      toast.success(`You're all set as a ${role}!`)
      router.replace(role === 'creator' ? '/creator' : '/dashboard')
    } catch {
      toast.error('Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome aboard!</h1>
          <p className="mt-2 text-slate-500">How would you like to use Ocean Across?</p>
        </div>

        <div className="grid gap-4">
          <Card
            className="cursor-pointer border-2 transition-all hover:border-blue-500 hover:shadow-md"
            onClick={() => handleSelectRole('user')}
          >
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="flex items-center justify-between">
                I want to learn
                {loading === 'user' && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Browse and book sessions from creators and experts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer border-2 transition-all hover:border-purple-500 hover:shadow-md"
            onClick={() => handleSelectRole('creator')}
          >
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="flex items-center justify-between">
                I want to create
                {loading === 'creator' && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Create and manage sessions, build your audience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
      <SelectRoleContent />
    </Suspense>
  )
}
