'use client'

import Link from 'next/link'
import { FaUser } from 'react-icons/fa'
import { LogOutIcon, SettingsIcon } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useCurrentUser } from '@/hooks/use-current-user'
import { LogoutButton } from './logout-button'

export const UserButton = () => {
  const user = useCurrentUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem>
          <Link href="/settings" className="flex w-full items-center gap-x-2">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/api-keys" className="flex w-full items-center gap-x-2">
            <SettingsIcon className="mr-2 h-4 w-4" />
            API Keys
          </Link>
        </DropdownMenuItem>
        <LogoutButton>
          <DropdownMenuItem>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
