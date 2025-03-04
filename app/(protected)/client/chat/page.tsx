'use client'

import { useState } from 'react'

import { initialMessages } from '@/mock/chat'
import { ChatMessage } from '@/types/chat'

import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { ChatInput } from './components/chat-input'
import { ChatMessage as ChatMessageComponent } from './components/chat-message'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  const handleSendMessage = (content: string) => {
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prev) => [...prev, userMessage])

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${content}"，processing...`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
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
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
        </div>
        {/* Input Area   */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <ChatInput onSendAction={handleSendMessage} />
        </div>
      </Card>
    </div>
  )
}
