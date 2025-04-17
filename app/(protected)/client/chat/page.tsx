'use client'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'

interface Chat {
  id: string
  title: string
  isPublic: boolean
  user: {
    id: string
    name: string | null
    image: string | null
  }
  collaborators: {
    id: string
    name: string | null
    image: string | null
  }[]
  createdAt: string
  updatedAt: string
}

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats')
        if (!response.ok) {
          throw new Error('Failed to fetch chats')
        }
        const data = await response.json()
        setChats(data)
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChats()
  }, [])

  const handleCreateChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
          isPublic: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const chat = await response.json()
      router.push(`/client/chat/${chat.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title="Chat" />
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex justify-end">
          <Button onClick={handleCreateChat}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="flex cursor-pointer flex-col gap-2 p-4 hover:bg-accent"
              onClick={() => router.push(`/client/chat/${chat.id}`)}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{chat.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[chat.user, ...chat.collaborators].map((user) => (
                    <img
                      key={user.id}
                      src={user.image || '/default-avatar.png'}
                      alt={user.name || 'User'}
                      className="h-6 w-6 rounded-full border-2 border-background"
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
