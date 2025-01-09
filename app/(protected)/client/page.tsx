import { auth } from '@/auth'
import { UserInfo } from '@/components/user-info'
import { currentUser } from '@/lib/auth'

const ServerPage = async () => {
  const user = await currentUser()
  return (
    <div className="flex flex-col gap-y-4">
      <UserInfo user={user} label="Server component" />
    </div>
  )
}

export default ServerPage
