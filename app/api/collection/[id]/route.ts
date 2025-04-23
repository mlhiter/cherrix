import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collection = await db.collection.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Failed to fetch collection:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch collection' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { lastSyncTime } = body

    const collection = await db.collection.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : undefined,
      },
    })

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Failed to update collection:', error)
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 })
  }
}
