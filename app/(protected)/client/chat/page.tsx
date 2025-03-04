'use client'

import { useChat } from '@ai-sdk/react'

import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { ChatMessage as ChatMessageComponent } from './components/chat-message'
import { Mention } from './components/mention'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaperPlaneIcon } from '@radix-ui/react-icons'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 10,
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

      <Card className="relative flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              content={message.content}
              role={
                message.role === 'assistant' || message.role === 'user'
                  ? message.role
                  : 'user'
              }
            />
          ))}
        </div>
        {/* Input Area   */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
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
                />
              </div>
              <Button
                onClick={handleSubmit}
                className="h-10 w-10 rounded-full p-0 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                disabled={!input.trim()}
                aria-label="Send Message">
                <PaperPlaneIcon className="h-5 w-5" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
