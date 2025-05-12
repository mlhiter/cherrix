import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

// GET /api/collection/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  const { id } = await params
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

// PATCH /api/collection/[id]
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, metadata, lastSyncTime } = body

    const collection = await db.collection.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        // content, FIXME: add content
        metadata,
        lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : undefined,
      },
    })

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Failed to update collection:', error)
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 })
  }
}
