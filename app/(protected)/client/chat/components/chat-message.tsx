'use client'

import { FaUser } from 'react-icons/fa'
import { ChatRole } from '@prisma/client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Citation } from './citation'
import { useCurrentUser } from '@/hooks/use-current-user'

interface ChatMessageProps {
  content: string
  timestamp: string
  role: ChatRole
  context?: string[]
}

export function ChatMessage({ content, timestamp, role, context = [] }: ChatMessageProps) {
  const user = useCurrentUser()

  const renderContent = (text: string) => {
    const parts = text.split(/(\[citation:\d+\])/g)
    return parts.map((part, index) => {
      const match = part.match(/\[citation:(\d+)\]/)
      if (match) {
        const citationIndex = parseInt(match[1])
        const citationContent = context[citationIndex - 1] || 'No context available'
        return <Citation key={index} index={citationIndex} content={citationContent} />
      }
      return <span key={index}>{part}</span>
    })
  }

  if (role === 'user') {
    return (
      <div className="flex items-start justify-end gap-2">
        <div>
          <div className="rounded-lg bg-primary/90 p-3 text-primary-foreground">{content}</div>
          {timestamp && <div className="mt-1 text-right text-xs opacity-70">{timestamp}</div>}
        </div>

        <Avatar>
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback className="bg-secondary">
            <FaUser className="text-secondary-foreground" />
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar>
        <AvatarImage src={''} />
        <AvatarFallback className="bg-accent text-accent-foreground">🍒</AvatarFallback>
      </Avatar>
      <div>
        <div className="rounded-lg bg-muted p-3 text-muted-foreground">{renderContent(content)}</div>
        {timestamp && <div className="mt-1 text-xs opacity-70">{timestamp}</div>}
      </div>
    </div>
  )
}
