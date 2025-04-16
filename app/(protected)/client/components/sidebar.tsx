'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Boxes, Code, File, MessageCircle, Notebook } from 'lucide-react'

import { LinkButton } from './link-button'
import { ResourceList } from './resource-list'
import { Divider } from '@/components/divider'

export const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col gap-y-4">
      {/* Document, Boxes, Notebook */}
      <div className="flex gap-2">
        <LinkButton
          onClick={() => router.push('/client/document')}
          icon={<File />}
          isActive={pathname === '/client/document'}
        />
        <LinkButton
          onClick={() => router.push('/client/collection')}
          icon={<Boxes />}
          isActive={pathname === '/client/collection'}
        />
        <LinkButton
          onClick={() => router.push('/client/notebook')}
          icon={<Notebook />}
          isActive={pathname === '/client/notebook'}
        />
      </div>
      {/* Chat */}
      <LinkButton
        onClick={() => router.push('/client/chat')}
        icon={<MessageCircle />}
        label="Chat"
        isActive={pathname === '/client/chat'}
      />
      {/* Code */}
      <LinkButton
        onClick={() => router.push('/client/code')}
        icon={<Code />}
        label="Code"
        isActive={pathname === '/client/code'}
      />
      <Divider />
      {/* Resource List */}
      <ResourceList />
    </div>
  )
}
