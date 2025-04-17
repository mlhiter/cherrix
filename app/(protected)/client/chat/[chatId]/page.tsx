'use client'

import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { ChatRole } from '@prisma/client'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { PaperPlaneIcon } from '@radix-ui/react-icons'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

import { ChatMessage as ChatMessageComponent } from '../components/chat-message'

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
  messages: {
    id: string
    content: string
    role: ChatRole
    createdAt: string
  }[]
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const [chat, setChat] = useState<Chat | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch chat')
        }
        const data = await response.json()
        setChat(data)
      } catch (error) {
        console.error('Error fetching chat:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (chatId) {
      fetchChat()
    }
  }, [chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const handleSubmit = async () => {
    if (!input.trim() || !chat) return

    setIsSubmitting(true)
    try {
      // Send user message
      const userMessageResponse = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input,
          role: 'USER',
        }),
      })

      if (!userMessageResponse.ok) {
        throw new Error('Failed to send message')
      }

      const userMessage = await userMessageResponse.json()

      // Update chat with user message
      setChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
        }
      })

      // Get AI response
      const aiResponse = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: '',
          role: 'ASSISTANT',
        }),
      })

      if (!aiResponse.ok) {
        throw new Error('Failed to get AI response')
      }

      // Create a temporary AI message
      const tempAiMessage = {
        id: 'temp',
        content: '',
        role: 'ASSISTANT' as const,
        createdAt: new Date().toISOString(),
      }

      setChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, tempAiMessage],
        }
      })

      // Handle streaming response
      const reader = aiResponse.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      let aiMessageContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        aiMessageContent += chunk

        setChat((prev) => {
          if (!prev) return null
          const messages = [...prev.messages]
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.id === 'temp') {
            lastMessage.content = aiMessageContent
          }
          return {
            ...prev,
            messages,
          }
        })
      }

      // Refresh chat to get final state
      const response = await fetch(`/api/chats/${chatId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chat')
      }
      const data = await response.json()
      setChat(data)
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Chat not found
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={chat.title} />
      <div className="flex h-[calc(100vh-190px)] flex-col">
        <Card className="relative flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {chat.messages.map((message) => (
                  <ChatMessageComponent
                    key={message.id}
                    content={message.content}
                    timestamp={format(new Date(message.createdAt), 'HH:mm')}
                    role={message.role}
                  />
                ))}
                <div ref={messagesEndRef} />
                {isSubmitting && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is responding...</span>
                  </div>
                )}
              </div>
            </div>
            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border p-2">
                  <Input
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                    placeholder="Input your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  className="h-10 w-10 rounded-full p-0 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                  disabled={!input.trim() || isSubmitting}
                  aria-label="Send Message">
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <PaperPlaneIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send Message</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
