'use client'

import { UserButton } from '@/components/auth/user-button'

export const Navbar = () => {
  return (
    <div className="w-full items-center justify-between bg-secondary p-4 shadow-sm">
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex gap-x-2 text-2xl font-bold">🍒 Cherrix</div>
        <UserButton />
      </div>
    </div>
  )
}
