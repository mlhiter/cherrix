'use client'

import { FaUser } from 'react-icons/fa'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useCurrentUser } from '@/hooks/use-current-user'

interface ChatMessageProps {
  content: string
  role: 'assistant' | 'user'
  timestamp?: string
}

export const ChatMessage = ({ content, role, timestamp }: ChatMessageProps) => {
  const user = useCurrentUser()

  if (role === 'user') {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="rounded-lg bg-primary/90 p-3 text-primary-foreground">
          <p>{content}</p>
          {timestamp && (
            <div className="mt-1 text-right text-xs opacity-70">
              {timestamp}
            </div>
          )}
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
        <AvatarFallback className="bg-accent text-accent-foreground">
          🍒
        </AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted p-3 text-muted-foreground">
        <p>{content}</p>
        {timestamp && (
          <div className="mt-1 text-xs opacity-70">{timestamp}</div>
        )}
      </div>
    </div>
  )
}
