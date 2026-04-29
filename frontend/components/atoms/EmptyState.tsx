import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-xl border border-dashed p-12 text-center', className)}>
      <p className="text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
