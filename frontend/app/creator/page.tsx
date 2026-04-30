'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCreatorSessions, useCreateSession, useUpdateSession, useDeleteSession } from '@/hooks/useSessions'
import { useCreatorBookings } from '@/hooks/useBookings'
import { Session } from '@/types'
import { StatCard } from '@/components/molecules/StatCard'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { EmptyState } from '@/components/atoms/EmptyState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { PriceLabel } from '@/components/atoms/PriceLabel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface SessionFormData {
  title: string
  description: string
  price: string
  datetime: string
  duration_mins: string
  capacity: string
  thumbnail_url: string
  thumbnail: File | null
  status: string
}

const EMPTY_FORM: SessionFormData = {
  title: '', description: '', price: '0', datetime: '',
  duration_mins: '60', capacity: '10', thumbnail_url: '', thumbnail: null, status: 'published',
}

export default function CreatorDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/')
    if (!authLoading && user && user.role !== 'creator') router.replace('/dashboard')
  }, [authLoading, isAuthenticated, user])

  const { data: sessions, isLoading: sessionsLoading } = useCreatorSessions()
  const { data: bookings, isLoading: bookingsLoading } = useCreatorBookings()
  const createSession = useCreateSession()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [form, setForm] = useState<SessionFormData>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.session.price), 0) ?? 0

  const openCreate = () => {
    setEditingSession(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (session: Session) => {
    setEditingSession(session)
    setForm({
      title: session.title,
      description: session.description,
      price: session.price,
      datetime: session.datetime.slice(0, 16),
      duration_mins: String(session.duration_mins),
      capacity: String(session.capacity),
      thumbnail_url: session.thumbnail_url,
      thumbnail: null,
      status: session.status,
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { thumbnail, ...rest } = form
    const payload: Record<string, any> = { ...rest }
    if (thumbnail) payload.thumbnail = thumbnail

    if (editingSession) {
      updateSession.mutate(
        { id: editingSession.id, data: payload },
        { onSuccess: () => { setDialogOpen(false); setEditingSession(null) } }
      )
    } else {
      createSession.mutate(payload, {
        onSuccess: () => { setDialogOpen(false); setForm(EMPTY_FORM) }
      })
    }
  }

  if (authLoading) return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Loading...</div>

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Creator Dashboard</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Session
        </Button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Sessions" value={sessions?.length ?? 0} />
        <StatCard label="Total Bookings" value={bookings?.length ?? 0} />
        <StatCard label="Total Revenue" value={totalRevenue === 0 ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`} />
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="mb-6">
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="bookings">Bookings Received</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <SessionsTab
            sessions={sessions}
            isLoading={sessionsLoading}
            onEdit={openEdit}
            onDelete={(id) => setDeleteId(id)}
            onCreateFirst={openCreate}
            isDeleting={deleteSession.isPending}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab bookings={bookings} isLoading={bookingsLoading} />
        </TabsContent>
      </Tabs>

      <SessionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onChange={(key, val) => setForm(f => ({ ...f, [key]: val }))}
        onSubmit={handleSubmit}
        isSubmitting={createSession.isPending || updateSession.isPending}
        isEditing={!!editingSession}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Session"
        description="This will permanently delete this session and all its bookings. This action cannot be undone."
        confirmLabel="Delete"
        isPending={deleteSession.isPending}
        onConfirm={() => deleteId !== null && deleteSession.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
      />
    </div>
  )
}

function SessionsTab({ sessions, isLoading, onEdit, onDelete, onCreateFirst, isDeleting }: {
  sessions?: Session[]; isLoading: boolean
  onEdit: (s: Session) => void; onDelete: (id: number) => void
  onCreateFirst: () => void; isDeleting: boolean
}) {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
  if (!sessions?.length) return (
    <EmptyState
      message="No sessions yet"
      action={<Button onClick={onCreateFirst} className="gap-2"><Plus className="h-4 w-4" />Create your first session</Button>}
    />
  )
  return (
    <div className="space-y-3">
      {sessions.map(session => (
        <div key={session.id} className="flex items-center justify-between rounded-xl border p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/sessions/${session.id}`} className="font-medium text-slate-900 transition-colors hover:text-blue-700">
                {session.title}
              </Link>
              <StatusBadge status={session.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(session.datetime), 'MMM d, yyyy • h:mm a')}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.bookings_count} / {session.capacity} booked</span>
              <PriceLabel price={session.price} />
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(session)}><Pencil className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(session.id)} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ bookings, isLoading }: { bookings?: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
  if (!bookings?.length) return <EmptyState message="No bookings yet" />
  return (
    <div className="space-y-3">
      {bookings.map(b => (
        <div key={b.id} className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium text-slate-900">{b.session.title}</p>
            <p className="text-sm text-slate-500">by {b.user.name || b.user.email} · {format(new Date(b.booked_at), 'MMM d, yyyy')}</p>
          </div>
          <StatusBadge status={b.status} />
        </div>
      ))}
    </div>
  )
}

function SessionFormDialog({ open, onOpenChange, form, onChange, onSubmit, isSubmitting, isEditing }: {
  open: boolean; onOpenChange: (v: boolean) => void
  form: SessionFormData; onChange: (key: keyof SessionFormData, val: any) => void
  onSubmit: (e: React.FormEvent) => void; isSubmitting: boolean; isEditing: boolean
}) {
  const field = (key: keyof SessionFormData) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(key, e.target.value),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Session' : 'Create Session'}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><Label>Title *</Label><Input {...field('title')} required className="mt-1" /></div>
          <div><Label>Description *</Label><Textarea {...field('description')} rows={3} required className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (₹)</Label><Input type="number" min="0" {...field('price')} className="mt-1" /></div>
            <div><Label>Duration (mins)</Label><Input type="number" min="15" {...field('duration_mins')} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date & Time *</Label><Input type="datetime-local" {...field('datetime')} required className="mt-1" /></div>
            <div><Label>Capacity</Label><Input type="number" min="1" {...field('capacity')} className="mt-1" /></div>
          </div>
          <div>
            <Label>Thumbnail</Label>
            <Input type="file" accept="image/*" className="mt-1"
              onChange={(e) => onChange('thumbnail', e.target.files?.[0] || null)} />
            {form.thumbnail && <p className="mt-1 text-xs text-slate-500">{form.thumbnail.name}</p>}
          </div>
          <div>
            <Label>Status</Label>
            <select {...field('status')} className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
