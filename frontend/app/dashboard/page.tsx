'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserBookings, useCancelBooking } from '@/hooks/useBookings'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/services/auth.service'
import { BookingRow } from '@/components/molecules/BookingRow'
import { EmptyState } from '@/components/atoms/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Link from 'next/link'
import { isFuture } from 'date-fns'

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { setUser } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/')
    if (!authLoading && user?.role === 'creator') router.replace('/creator')
  }, [authLoading, isAuthenticated, user])

  const { data: bookings, isLoading: bookingsLoading } = useUserBookings()
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking()

  const [name, setName] = useState(user?.name ?? '')
  useEffect(() => { if (user?.name) setName(user.name) }, [user])

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: () => AuthService.updateProfile({ name, avatar_url: user?.avatar_url ?? '' }),
    onSuccess: (data) => { setUser(data); toast.success('Profile updated') },
    onError: () => toast.error('Failed to update profile'),
  })

  const active = bookings?.filter(b => b.status === 'confirmed' && isFuture(new Date(b.session.datetime))) ?? []
  const past = bookings?.filter(b => b.status === 'cancelled' || !isFuture(new Date(b.session.datetime))) ?? []

  if (authLoading) return <PageLoadingState />

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">My Dashboard</h1>

      <Tabs defaultValue="bookings">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingSection
            title="Upcoming"
            bookings={active}
            isLoading={bookingsLoading}
            onCancel={cancelBooking}
            isCancelling={isCancelling}
            emptyMessage="No upcoming bookings"
            emptyAction={<Link href="/" className="text-sm text-blue-600 hover:underline">Browse sessions →</Link>}
          />
          <BookingSection
            title="Past & Cancelled"
            bookings={past}
            isLoading={bookingsLoading}
            emptyMessage="None yet"
            className="mt-8"
          />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileEditor
            user={user}
            name={name}
            onNameChange={setName}
            onSave={() => saveProfile()}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingSection({ title, bookings, isLoading, onCancel, isCancelling, emptyMessage, emptyAction, className }: {
  title: string
  bookings: any[]
  isLoading: boolean
  onCancel?: (id: number) => void
  isCancelling?: boolean
  emptyMessage: string
  emptyAction?: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-lg font-semibold">{title} ({bookings.length})</h2>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : bookings.length === 0 ? (
        <EmptyState message={emptyMessage} action={emptyAction} />
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <BookingRow key={b.id} booking={b} onCancel={onCancel} isCancelling={isCancelling} />
          ))}
        </div>
      )}
    </section>
  )
}

function ProfileEditor({ user, name, onNameChange, onSave, isSaving }: {
  user: any; name: string; onNameChange: (v: string) => void; onSave: () => void; isSaving: boolean
}) {
  return (
    <Card className="max-w-md">
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback>{user?.name?.[0] ?? user?.email?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.email}</p>
            <Badge variant="outline" className="mt-1 capitalize">{user?.role}</Badge>
          </div>
        </div>
        <div>
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={e => onNameChange(e.target.value)} className="mt-1" />
        </div>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </CardContent>
    </Card>
  )
}

function PageLoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Loading...</div>
  )
}
