import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const LinkButton = ({
  onClick,
  label,
  icon,
  isActive = false,
  collapsed = false,
}: {
  onClick: () => void
  label?: string
  icon?: React.ReactNode
  isActive?: boolean
  collapsed?: boolean
}) => {
  return (
    <Button
      className={cn(
        'relative text-sm transition-all duration-200 hover:bg-blue-50/70',
        isActive
          ? 'translate-y-[-1px] border border-blue-200 bg-blue-50 font-medium text-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.18)]'
          : 'bg-white text-gray-700 hover:text-blue-600',
        collapsed ? 'w-auto min-w-0 px-2' : 'w-full min-w-fit'
      )}
      onClick={onClick}>
      <span className={cn('flex items-center justify-center', isActive && 'text-blue-500')}>{icon}</span>
      {label && !collapsed && <span className="ml-2">{label}</span>}
      {isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-blue-50/30 to-blue-100/50 opacity-60" />
      )}
    </Button>
  )
}
