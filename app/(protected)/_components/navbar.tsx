'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { UserButton } from '@/components/auth/user-button'

export const Navbar = () => {
  const pathname = usePathname()

  return (
    <div className="w-[600px] items-center justify-between rounded-xl bg-secondary p-4 shadow-sm">
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex gap-x-2">
          <Button
            asChild
            variant={pathname === '/server' ? 'default' : 'outline'}>
            <Link href="/server">server</Link>
          </Button>
          <Button
            asChild
            variant={pathname === '/client' ? 'default' : 'outline'}>
            <Link href="/client">client</Link>
          </Button>
          <Button
            asChild
            variant={pathname === '/admin' ? 'default' : 'outline'}>
            <Link href="/admin">Admin</Link>
          </Button>
          <Button
            asChild
            variant={pathname === '/settings' ? 'default' : 'outline'}>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
        <UserButton />
      </div>
    </div>
  )
}
