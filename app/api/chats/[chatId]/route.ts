import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chat = await db.chat.findUnique({
      where: {
        id: params.chatId,
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { id: session.user.id } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Not Found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, isPublic, collaborators } = await req.json()

    const chat = await db.chat.update({
      where: {
        id: params.chatId,
        userId: session.user.id,
      },
      data: {
        title,
        isPublic,
        collaborators: {
          set: collaborators?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.chat.delete({
      where: {
        id: params.chatId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
