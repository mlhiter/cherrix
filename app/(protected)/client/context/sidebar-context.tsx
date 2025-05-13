'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
})

export const useSidebarContext = () => useContext(SidebarContext)

interface SidebarProviderProps {
  children: ReactNode
  initialCollapsed?: boolean
}

export const SidebarProvider = ({ children, initialCollapsed = false }: SidebarProviderProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return <SidebarContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarContext.Provider>
}
