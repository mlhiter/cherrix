'use client'

import { UserButton } from '@/components/auth/user-button'
import { useRouter } from 'next/navigation'

export const Navbar = () => {
  const router = useRouter()
  return (
    <div className="w-full items-center justify-between bg-secondary p-4 shadow-sm">
      <div className="flex items-center justify-between gap-x-2">
        <div
          className="flex gap-x-2 text-2xl font-bold hover:cursor-pointer hover:text-primary"
          onClick={() => router.push('/client/home')}>
          🍒 Cherrix
        </div>
        <UserButton />
      </div>
    </div>
  )
}
