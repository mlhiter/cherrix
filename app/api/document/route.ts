import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const documents = await db.document.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
      orderBy: {
        importTime: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      documents: documents,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const { documentId } = await req.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.userId !== userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'You do not have permission to delete this document',
        },
        { status: 403 }
      )
    }

    // soft delete
    await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        isDeleted: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete document',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
