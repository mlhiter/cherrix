'use client'

import { format } from 'date-fns'
import { useChat } from '@ai-sdk/react'
import { ChatRole } from '@prisma/client'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { PaperPlaneIcon } from '@radix-ui/react-icons'

import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { ChatMessage as ChatMessageComponent } from '../components/chat-message'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [initialMessages, setInitialMessages] = useState([])

  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/message`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        setInitialMessages(data)
      } catch (error) {
        console.error('Error fetching initial messages:', error)
      }
    }
    fetchInitialMessages()
  }, [chatId])

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    maxSteps: 10,
    initialMessages,
    api: `/api/chat/${chatId}/message`,
    onFinish: async (message) => {
      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
          role: 'assistant',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to store message')
      }
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title="Chat" />
      <div className="flex h-[calc(100vh-190px)] flex-col">
        <Card className="relative flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessageComponent
                    key={message.id}
                    content={message.content}
                    timestamp={format(message.createdAt ?? new Date(), 'HH:mm')}
                    role={message.role as ChatRole}
                  />
                ))}
                <div ref={messagesEndRef} />
                {status === 'submitted' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Message sent, waiting for response...</span>
                  </div>
                )}
                {status === 'streaming' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is responding...</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to get response. Please try again.</span>
                  </div>
                )}
              </div>
            </div>
            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border p-2">
                  <Input
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                    placeholder="Input your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={status === 'submitted' || status === 'streaming'}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 w-10 rounded-full p-0 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                  disabled={
                    !input.trim() ||
                    status === 'submitted' ||
                    status === 'streaming'
                  }
                  aria-label="Send Message">
                  {status === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <PaperPlaneIcon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Send Message</span>
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
