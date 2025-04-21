'use client'

import { Navbar } from './components/navbar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const isClientRoute = pathname.startsWith('/client')

  return (
    <div className="flex h-full w-full flex-col items-center bg-sky-500">
      <Navbar />
      {!isClientRoute && (
        <div className="container my-6">
          <Button variant="ghost" onClick={() => router.push('/client/home')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      )}
      {children}
    </div>
  )
}

export default ProtectedLayout
