import { LucideIcon, MessageCircle, Notebook, Trash, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Resource {
  id: string
  title: string
}

interface ResourceItemProps {
  item: Resource
  type: 'note' | 'chat'
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, newTitle: string) => Promise<void>
}

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  note: Notebook,
  chat: MessageCircle,
}

export const ResourceItem = ({ item, type, onDelete, onRename }: ResourceItemProps) => {
  const Icon = RESOURCE_ICONS[type]
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState(item.title)

  const handleClick = () => {
    if (isEditing) return
    const basePath = type === 'note' ? '/client/notebook' : '/client/chat'
    router.push(`${basePath}/${item.id}`)
  }

  const handleRenameSubmit = async () => {
    if (newTitle.trim() && newTitle !== item.title) {
      await onRename(item.id, newTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setNewTitle(item.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="group flex min-h-6 items-center justify-between gap-2">
      <div
        className="flex flex-1 cursor-pointer items-center gap-2 transition-colors hover:text-primary"
        onClick={handleClick}>
        <Icon className="h-4 w-4" />
        {isEditing ? (
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className="h-7 w-full"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm font-medium">{item.title}</div>
        )}
      </div>
      <div className="flex opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
