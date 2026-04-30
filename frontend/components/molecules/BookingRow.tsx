import Link from 'next/link'
import { useState } from 'react'
import { Booking } from '@/types'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { Calendar, Clock, X } from 'lucide-react'
import { format } from 'date-fns'

interface BookingRowProps {
  booking: Booking
  onCancel?: (id: number) => void
  isCancelling?: boolean
}

export function BookingRow({ booking, onCancel, isCancelling }: BookingRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="min-w-0 flex-1">
        <Link
          href={`/sessions/${booking.session.id}`}
          className="font-medium text-slate-900 transition-colors hover:text-blue-700"
        >
          {booking.session.title}
        </Link>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(booking.session.datetime), 'MMM d, yyyy • h:mm a')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {booking.session.duration_mins}m
          </span>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3">
        <StatusBadge status={booking.status} />
        {onCancel && booking.status === 'confirmed' && (
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmOpen(true)}
            disabled={isCancelling}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel Booking"
        description={`Cancel your booking for "${booking.session.title}"? You won't be able to rebook this session.`}
        confirmLabel="Cancel Booking"
        isPending={isCancelling}
        onConfirm={() => onCancel?.(booking.id)}
      />
    </div>
  )
}
