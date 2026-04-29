import Link from 'next/link'
import { Session } from '@/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PriceLabel } from '@/components/atoms/PriceLabel'
import { Calendar, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  const isFull = session.spots_remaining === 0
  const isPast = new Date(session.datetime) < new Date()

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <SessionThumbnail
          src={session.thumbnail_url}
          alt={session.title}
          isBooked={session.is_booked}
          isFull={isFull}
          isPast={isPast}
        />

        <CardContent className="p-4">
          <h3 className="mb-1 line-clamp-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
            {session.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-500">{session.description}</p>

          <CreatorByline creator={session.creator} />

          <SessionMeta
            datetime={session.datetime}
            durationMins={session.duration_mins}
            spotsRemaining={session.spots_remaining}
          />
        </CardContent>

        <CardFooter className="border-t px-4 py-3">
          <PriceLabel price={session.price} className="font-bold text-slate-900" />
        </CardFooter>
      </Card>
    </Link>
  )
}

function SessionThumbnail({
  src, alt, isBooked, isFull, isPast,
}: {
  src: string; alt: string; isBooked: boolean; isFull: boolean; isPast: boolean
}) {
  return (
    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-4xl text-slate-400">🎯</div>
      )}
      <div className="absolute right-3 top-3 flex gap-1">
        {isBooked && <Badge className="bg-green-600 text-white">Booked</Badge>}
        {isFull && !isBooked && <Badge variant="destructive">Full</Badge>}
        {isPast && <Badge variant="secondary">Past</Badge>}
      </div>
    </div>
  )
}

function CreatorByline({ creator }: { creator: Session['creator'] }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={creator.avatar_url} />
        <AvatarFallback>{creator.name?.[0] ?? 'C'}</AvatarFallback>
      </Avatar>
      <span className="text-xs text-slate-500">{creator.name || creator.email}</span>
    </div>
  )
}

function SessionMeta({ datetime, durationMins, spotsRemaining }: {
  datetime: string; durationMins: number; spotsRemaining: number
}) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {format(new Date(datetime), 'MMM d, yyyy')}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {durationMins}m
      </span>
      <span className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {spotsRemaining} spots
      </span>
    </div>
  )
}
