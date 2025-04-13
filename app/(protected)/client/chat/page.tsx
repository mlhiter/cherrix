'use client'

import { format } from 'date-fns'
import { useChat } from '@ai-sdk/react'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { Loader2, AlertCircle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { Mention } from './components/mention'
import { ChatMessage as ChatMessageComponent } from './components/chat-message'

import { initialMessages } from '@/constants/chat'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    maxSteps: 10,
    initialMessages: initialMessages,
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
                    role={
                      message.role === 'assistant' || message.role === 'user'
                        ? message.role
                        : 'user'
                    }
                  />
                ))}
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
              <div className="flex w-full flex-col gap-2">
                <Mention />
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-lg border p-2">
                    <Input
                      className="flex-1 border-none shadow-none focus-visible:ring-0"
                      placeholder="Input your message..."
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={
                        status === 'submitted' || status === 'streaming'
                      }
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="h-10 w-10 rounded-full p-0 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                    disabled={
                      !input.trim() ||
                      status === 'submitted' ||
                      status === 'streaming'
                    }
                    aria-label="Send Message">
                    {status === 'submitted' || status === 'streaming' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <PaperPlaneIcon className="h-5 w-5" />
                    )}
                    <span className="sr-only">Send Message</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
