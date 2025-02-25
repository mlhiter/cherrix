'use client'

import { RoleGate } from '@/components/auth/role-gate'
import { FormSuccess } from '@/components/form-success'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useCurrentRole } from '@/hooks/use-current-role'
import { UserRole } from '@prisma/client'

const AdminPage = () => {
  const role = useCurrentRole()
  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-center text-2xl font-semibold">Admin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message="You are authorized to access this page" />
          <p className="text-lg">{role}</p>
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
            <p className="text-sm font-medium">Admin-only API Route</p>
            <Button>Click to test</Button>
          </div>
        </RoleGate>
      </CardContent>
    </Card>
  )
}

export default AdminPage
