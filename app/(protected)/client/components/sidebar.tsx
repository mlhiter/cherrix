'use client'

import { useRouter } from 'next/navigation'
import { Boxes, Code, File, MessageCircle, Notebook } from 'lucide-react'

import { PinList } from './pin-list'
import { LinkButton } from './link-button'
import { Divider } from '@/components/divider'

export const Sidebar = () => {
  const router = useRouter()
  return (
    <div className="flex w-64 flex-col gap-y-4">
      {/* Document, Boxes, Notebook */}
      <div className="flex gap-2">
        <LinkButton
          onClick={() => router.push('/client/document')}
          icon={<File />}
        />
        <LinkButton
          onClick={() => router.push('/client/boxes')}
          icon={<Boxes />}
        />
        <LinkButton
          onClick={() => router.push('/client/notebook')}
          icon={<Notebook />}
        />
      </div>
      {/* Chat */}
      <LinkButton
        onClick={() => router.push('/client/chat')}
        icon={<MessageCircle />}
        label="Chat"
      />
      {/* Code */}
      <LinkButton
        onClick={() => router.push('/client/code')}
        icon={<Code />}
        label="Code"
      />
      <Divider />
      {/* Pin */}
      <PinList />
    </div>
  )
}
