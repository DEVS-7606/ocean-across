import api from '@/lib/api'
import { Booking } from '@/types'

export const BookingsService = {
  getUserBookings: (): Promise<Booking[]> =>
    api.get('/bookings/').then((r) => r.data),

  getCreatorBookings: (): Promise<Booking[]> =>
    api.get('/sessions/creator/bookings/').then((r) => r.data),

  book: (sessionId: number): Promise<Booking> =>
    api.post(`/bookings/sessions/${sessionId}/book/`).then((r) => r.data),

  cancel: (bookingId: number): Promise<void> =>
    api.delete(`/bookings/${bookingId}/cancel/`).then((r) => r.data),
}
