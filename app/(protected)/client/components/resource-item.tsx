import { LucideIcon, MessageSquare, FileMinus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface Resource {
  id: string
  title: string
}

interface ResourceItemProps {
  item: Resource
  type: 'note' | 'chat'
  onDelete: (id: string) => Promise<void>
}

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  note: FileMinus,
  chat: MessageSquare,
}

export const ResourceItem = ({ item, type, onDelete }: ResourceItemProps) => {
  const Icon = RESOURCE_ICONS[type]
  const router = useRouter()

  const handleClick = () => {
    const basePath = type === 'note' ? '/client/notebook' : '/client/chat'
    router.push(`${basePath}/${item.id}`)
  }

  return (
    <div className="group flex min-h-6 items-center justify-between gap-2">
      <div
        className="flex flex-1 cursor-pointer items-center gap-2 transition-colors hover:text-primary"
        onClick={handleClick}>
        <Icon className="h-4 w-4" />
        <div className="text-sm font-medium">{item.title}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(item.id)
        }}>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}
