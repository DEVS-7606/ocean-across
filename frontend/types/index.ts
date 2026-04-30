export type Role = 'user' | 'creator'

export interface User {
  id: number
  email: string
  name: string
  avatar_url: string
  role: Role
  created_at: string
}

export interface Session {
  id: number
  creator: User
  title: string
  description: string
  price: string
  datetime: string
  duration_mins: number
  capacity: number
  spots_remaining: number
  thumbnail_url: string
  thumbnail_display: string | null
  status: 'draft' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
  is_booked: boolean
  bookings_count: number
}

export interface Booking {
  id: number
  session: Session
  user: User
  status: 'confirmed' | 'cancelled'
  booked_at: string
}
