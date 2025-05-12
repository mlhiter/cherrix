import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const collection = await db.collection.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        docItems: {
          include: {
            images: true,
            tableOfContents: true,
          },
        },
        blogItems: true,
        githubItems: true,
      },
    })

    if (!collection) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 500 })
    }

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch collection items' }, { status: 500 })
  }
}
