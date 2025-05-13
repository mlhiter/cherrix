'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Boxes, Code, File, MessageCircle, Notebook, ChevronLeft, Menu } from 'lucide-react'

import { LinkButton } from './link-button'
import { ResourceList } from './resource-list'
import { Divider } from '@/components/divider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSidebarContext } from '../context/sidebar-context'

export const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebarContext()

  const isCodePage = pathname.startsWith('/client/code')

  // Auto-handle sidebar collapse/expand based on route
  useEffect(() => {
    // We don't want to force collapse here - that's handled by the code page itself
    // But we can auto-expand when leaving the code page
    if (!pathname.startsWith('/client/code') && collapsed) {
      // Only auto-expand if we're not on the code page anymore
      setCollapsed(false)
    }
  }, [pathname, collapsed, setCollapsed])

  return (
    <div className={cn('flex flex-col gap-y-4 transition-all duration-300 ease-in-out', collapsed ? 'w-12' : 'w-64')}>
      {isCodePage && (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-10 w-12">
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Document, Boxes, Notebook */}
      <div className={cn('flex', collapsed ? 'flex-col gap-2' : 'gap-2')}>
        <LinkButton
          onClick={() => router.push('/client/document')}
          icon={<File />}
          isActive={pathname.startsWith('/client/document')}
          collapsed={collapsed}
        />
        <LinkButton
          onClick={() => router.push('/client/collection')}
          icon={<Boxes />}
          isActive={pathname.startsWith('/client/collection')}
          collapsed={collapsed}
        />
        <LinkButton
          onClick={() => router.push('/client/notebook')}
          icon={<Notebook />}
          isActive={pathname.startsWith('/client/notebook')}
          collapsed={collapsed}
        />
      </div>
      {/* Chat */}
      <LinkButton
        onClick={() => router.push('/client/chat')}
        icon={<MessageCircle />}
        label={!collapsed ? 'Chat' : undefined}
        isActive={pathname.startsWith('/client/chat')}
        collapsed={collapsed}
      />
      {/* Code */}
      <LinkButton
        onClick={() => router.push('/client/code')}
        icon={<Code />}
        label={!collapsed ? 'Code' : undefined}
        isActive={pathname.startsWith('/client/code')}
        collapsed={collapsed}
      />
      {!collapsed && <Divider />}
      {/* Resource List - only show when not collapsed */}
      {!collapsed && <ResourceList />}
    </div>
  )
}
