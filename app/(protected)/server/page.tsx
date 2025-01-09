'use client'

import { UserInfo } from '@/components/user-info'
import { useCurrentUser } from '@/hooks/use-current.user'

const ClientPage = () => {
  const user = useCurrentUser()
  return (
    <div className="flex flex-col gap-y-4">
      <UserInfo user={user} label="Server component" />
    </div>
  )
}

export default ClientPage
