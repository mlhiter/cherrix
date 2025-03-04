'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mention } from './mention'
import { PaperPlaneIcon } from '@radix-ui/react-icons'

interface ChatInputProps {
  onSendAction: (message: string) => void
}

export const ChatInput = ({ onSendAction }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (inputValue.trim()) {
      setIsLoading(true)
      try {
        await onSendAction(inputValue)
        setInputValue('')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Mention />
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border p-2">
          <Input
            className="flex-1 border-none shadow-none focus-visible:ring-0"
            placeholder="Input your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          onClick={handleSend}
          className="h-10 w-10 rounded-full p-0 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
          disabled={!inputValue.trim() || isLoading}
          aria-label="Send Message">
          <PaperPlaneIcon className="h-5 w-5" />
          <span className="sr-only">Send Message</span>
        </Button>
      </div>
    </div>
  )
}
