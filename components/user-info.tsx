import { ExtendedUser } from '@/next-auth'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'

interface UserInfoProps {
  user?: ExtendedUser
  label: string
}

export const UserInfo = ({ user, label }: UserInfoProps) => {
  return (
    <Card className="w-[600px] shadow-md">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">{label}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">ID</p>
          <p className="max-w-[200px] truncate text-xs">{user?.id}</p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Name</p>
          <p className="max-w-[200px] truncate text-xs">{user?.name}</p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Email</p>
          <p className="max-w-[200px] truncate text-xs">{user?.email}</p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Role</p>
          <p className="max-w-[200px] truncate text-xs">{user?.role}</p>
        </div>
        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <p className="text-sm font-medium">Two Factor Enabled</p>
          <Badge variant={user?.isTwoFactorEnabled ? 'success' : 'destructive'}>
            {user?.isTwoFactorEnabled ? 'On' : 'Off'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
