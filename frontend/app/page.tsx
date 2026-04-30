'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useSessionCatalog } from '@/hooks/useSessions'
import { SessionGrid } from '@/components/organisms/SessionGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GITHUB_OAUTH_URL } from '@/lib/constants'

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function HomePage() {
  const { accessToken } = useAuthStore()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)
  const { data: sessions, isLoading } = useSessionCatalog(debouncedSearch)

  return (
    <div className="container mx-auto px-4 py-8">
      {!accessToken && <HeroBanner />}

      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Browse Sessions</h2>
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <SessionGrid
        sessions={sessions}
        isLoading={isLoading}
        hasSearch={!!debouncedSearch}
        onClearSearch={() => setSearch('')}
      />
    </div>
  )
}

function HeroBanner() {
  return (
    <section className="mb-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-8 py-16 text-center text-white">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Learn from the best</h1>
      <p className="mb-8 text-lg text-slate-300">Book 1:1 sessions with creators, mentors, and experts.</p>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => { window.location.href = GITHUB_OAUTH_URL }}
        className="gap-2"
      >
        Get started with GitHub
      </Button>
    </section>
  )
}
