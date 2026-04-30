import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BookingsService } from '@/services/bookings.service'
import { Booking } from '@/types'

export function useUserBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: BookingsService.getUserBookings,
  })
}

export function useCreatorBookings() {
  return useQuery<Booking[]>({
    queryKey: ['creator-bookings'],
    queryFn: BookingsService.getCreatorBookings,
  })
}

export function useBookSession(sessionId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => BookingsService.book(sessionId),
    onSuccess: () => {
      toast.success('Session booked!')
      queryClient.invalidateQueries({ queryKey: ['session', String(sessionId)] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Booking failed')
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: number) => BookingsService.cancel(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to cancel'),
  })
}
