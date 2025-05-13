'use client'

import { Sidebar } from './components/sidebar'
import { cn } from '@/lib/utils'
import { SidebarProvider, useSidebarContext } from './context/sidebar-context'

interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientContent = ({ children }: ClientLayoutProps) => {
  const { collapsed } = useSidebarContext()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white p-4">
      <div className="flex w-full gap-6">
        <Sidebar />
        <main className={cn('flex flex-1 flex-col overflow-auto border-l p-4', collapsed && 'ml-0')}>{children}</main>
      </div>
    </div>
  )
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <SidebarProvider initialCollapsed={false}>
      <ClientContent>{children}</ClientContent>
    </SidebarProvider>
  )
}

export default ClientLayout
