import { NextResponse } from 'next/server'
import { currentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function PATCH(req: Request) {
  try {
    const user = await currentUser()

    if (!user || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, role, isTwoFactorEnabled, image } = body

    // Validate the role is a valid UserRole
    if (role && !Object.values(UserRole).includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        role,
        isTwoFactorEnabled,
        image,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('[SETTINGS_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
