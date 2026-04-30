'use client'

import { use } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSession } from '@/hooks/useSessions'
import { useBookSession } from '@/hooks/useBookings'
import { PriceLabel } from '@/components/atoms/PriceLabel'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { GITHUB_OAUTH_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { Calendar, Clock, Users, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: session, isLoading } = useSession(id)
  const { mutate: book, isPending: isBooking } = useBookSession(Number(id))

  if (isLoading) return <SessionDetailSkeleton />
  if (!session) return <div className="py-24 text-center text-slate-500">Session not found</div>

  const isFull = session.spots_remaining === 0
  const isPast = new Date(session.datetime) < new Date()
  const isOwner = user?.id === session.creator.id
  const canBook = !!user && !isOwner && !session.is_booked && !isFull && !isPast && user.role !== 'creator'

  const handleBook = () => {
    if (!user) {
      toast.info('Please sign in to book this session')
      window.location.href = GITHUB_OAUTH_URL
      return
    }
    book()
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to sessions
      </Link>

      {(session.thumbnail_display || session.thumbnail_url) && (
        <div className="mb-6 h-64 w-full overflow-hidden rounded-xl">
          <img src={session.thumbnail_display || session.thumbnail_url} alt={session.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{session.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {session.is_booked && <Badge className="bg-green-600">Booked</Badge>}
            {isFull && <Badge variant="destructive">Full</Badge>}
            {isPast && <StatusBadge status="past" />}
          </div>
        </div>
        <PriceLabel price={session.price} className="text-3xl font-bold text-slate-900" />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetaTile icon={<Calendar className="h-5 w-5 text-slate-400" />} label="Date & Time" value={format(new Date(session.datetime), 'MMM d, yyyy • h:mm a')} />
        <MetaTile icon={<Clock className="h-5 w-5 text-slate-400" />} label="Duration" value={`${session.duration_mins} minutes`} />
        <MetaTile icon={<Users className="h-5 w-5 text-slate-400" />} label="Availability" value={`${session.spots_remaining} / ${session.capacity} spots`} />
      </div>

      <Separator className="my-6" />

      <div className="mb-6 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={session.creator.avatar_url} />
          <AvatarFallback>{session.creator.name?.[0] ?? 'C'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{session.creator.name || session.creator.email}</p>
          <p className="text-sm text-slate-500">Creator</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 font-semibold text-slate-900">About this session</h2>
        <p className="whitespace-pre-line leading-relaxed text-slate-600">{session.description}</p>
      </div>

      <BookingAction
        isBooked={session.is_booked}
        isOwner={isOwner}
        canBook={canBook}
        isFull={isFull}
        isPast={isPast}
        isBooking={isBooking}
        onBook={handleBook}
      />
    </div>
  )
}

function MetaTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      {icon}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function BookingAction({ isBooked, isOwner, canBook, isFull, isPast, isBooking, onBook }: {
  isBooked: boolean; isOwner: boolean; canBook: boolean
  isFull: boolean; isPast: boolean; isBooking: boolean; onBook: () => void
}) {
  if (isBooked) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">You have booked this session</span>
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="rounded-xl bg-slate-50 p-4 text-center text-slate-500">
        This is your session
        <Link href="/creator" className="ml-2 text-blue-600 hover:underline">Manage it →</Link>
      </div>
    )
  }

  return (
    <Button size="lg" className="w-full" onClick={onBook} disabled={!canBook || isBooking}>
      {isBooking ? 'Booking...' : isFull ? 'Session Full' : isPast ? 'Session Ended' : 'Book Now'}
    </Button>
  )
}

function SessionDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-4 h-6 w-24" />
      <Skeleton className="mb-6 h-64 w-full rounded-xl" />
      <Skeleton className="mb-3 h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  )
}
