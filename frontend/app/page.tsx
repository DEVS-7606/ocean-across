'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useSessionCatalog } from '@/hooks/useSessions'
import { SessionGrid } from '@/components/organisms/SessionGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GITHUB_OAUTH_URL } from '@/lib/constants'

export default function HomePage() {
  const { accessToken } = useAuthStore()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { data: sessions, isLoading } = useSessionCatalog(debouncedSearch)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    clearTimeout((window as any)._searchTimer)
    ;(window as any)._searchTimer = setTimeout(() => setDebouncedSearch(e.target.value), 400)
  }

  const clearSearch = () => {
    setSearch('')
    setDebouncedSearch('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!accessToken && <HeroBanner />}

      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Browse Sessions</h2>
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-xs"
        />
      </div>

      <SessionGrid
        sessions={sessions}
        isLoading={isLoading}
        hasSearch={!!debouncedSearch}
        onClearSearch={clearSearch}
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
