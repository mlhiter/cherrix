'use client'

import { FaUser } from 'react-icons/fa'
import { LogOutIcon, SettingsIcon } from 'lucide-react'

import { LogoutButton } from './logout-button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SettingsDialog />
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
