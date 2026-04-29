import { Session } from '@/types'
import { SessionCard } from '@/components/molecules/SessionCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/atoms/EmptyState'

interface SessionGridProps {
  sessions?: Session[]
  isLoading: boolean
  onClearSearch?: () => void
  hasSearch?: boolean
}

export function SessionGrid({ sessions, isLoading, onClearSearch, hasSearch }: SessionGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SessionGridSkeleton key={i} />)}
      </div>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        message="No sessions found"
        action={
          hasSearch ? (
            <button
              onClick={onClearSearch}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear search
            </button>
          ) : null
        }
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}

function SessionGridSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="border-t px-4 py-3">
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}
