'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PreviewContextType {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}

const PreviewContext = createContext<PreviewContextType>({
  collapsed: false,
  setCollapsed: () => {},
})

export const usePreviewContext = () => useContext(PreviewContext)

interface PreviewProviderProps {
  children: ReactNode
  initialCollapsed?: boolean
}

export const PreviewProvider = ({ children, initialCollapsed = false }: PreviewProviderProps) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  return <PreviewContext.Provider value={{ collapsed, setCollapsed }}>{children}</PreviewContext.Provider>
}
