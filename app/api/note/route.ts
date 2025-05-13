import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }

    const { title, content, isPublic, collaborators } = await req.json()

    const note = await db.note.create({
      data: {
        title,
        content: JSON.stringify(content),
        isPublic,
        userId: session.user.id,
        collaborators: {
          connect: collaborators?.map((id: string) => ({ id })) || [],
        },
      },
    })
    await db.noteVersion.create({
      data: {
        title: `Version 1`,
        content: JSON.stringify(content),
        noteId: note.id,
        userId: session.user.id,
        versionNumber: 1,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('[NOTES_POST]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }

    const notes = await db.note.findMany({
      where: {
        OR: [{ userId: session.user.id }, { collaborators: { some: { id: session.user.id } } }],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('[NOTES_GET]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
