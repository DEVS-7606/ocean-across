import { Badge } from '@/components/ui/badge'

type Status = 'confirmed' | 'cancelled' | 'published' | 'draft' | string

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmed: 'default',
  published: 'default',
  cancelled: 'secondary',
  draft: 'outline',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={variantMap[status] ?? 'secondary'} className={`capitalize ${className ?? ''}`}>
      {status}
    </Badge>
  )
}
