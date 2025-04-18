import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chats = await db.chat.findMany({
      where: {
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
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// create a new chat
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, isPublic, collaborators, messages } = await req.json()

    const chat = await db.chat.create({
      data: {
        title,
        isPublic,
        userId: session.user.id,
        collaborators: {
          connect: collaborators?.map((id: string) => ({ id })) || [],
        },
        messages: {
          create: messages.map((message: any) => ({
            content: message.content,
            role: message.role,
          })),
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
    console.log('error', error)
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
