import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await auth()
    const { noteId } = await params

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }
    const note = await db.note.findUnique({
      where: {
        id: noteId,
        OR: [{ userId: session.user.id }, { collaborators: { some: { id: session.user.id } } }],
      },
    })

    if (!note) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(note)
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

export async function PATCH(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await auth()
    const { noteId } = await params
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }

    const { title, content, isPublic, collaborators } = await req.json()

    const currentNote = await db.note.findUnique({
      where: {
        id: noteId,
        OR: [{ userId: session.user.id }, { collaborators: { some: { id: session.user.id } } }],
      },
    })

    if (!currentNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const latestVersion = await db.noteVersion.findFirst({
      where: { noteId },
      orderBy: {
        versionNumber: 'desc',
      },
    })

    if (currentNote.content !== content) {
      const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

      await db.noteVersion.create({
        data: {
          title: `Version ${nextVersionNumber}`,
          content: currentNote.content,
          noteId: currentNote.id,
          userId: session.user.id,
          versionNumber: nextVersionNumber,
        },
      })
    }

    const note = await db.note.update({
      where: {
        id: noteId,
        OR: [{ userId: session.user.id }, { collaborators: { some: { id: session.user.id } } }],
      },
      data: {
        title,
        content,
        isPublic,
        collaborators: {
          set: collaborators?.map((id: string) => ({ id })) || [],
        },
      },
    })

    return NextResponse.json(note)
  } catch (error: any) {
    console.error('[NOTES_PATCH]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await auth()
    const { noteId } = await params
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }

    await db.note.delete({
      where: {
        id: noteId,
        OR: [{ userId: session.user.id }, { collaborators: { some: { id: session.user.id } } }],
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error('[NOTES_DELETE]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
