import { cn } from '@/lib/utils'
import { FileText, LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-60 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center',
        className
      )}>
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
