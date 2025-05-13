import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { noteId: string; versionId: string } }) {
  try {
    const session = await auth()
    const { noteId, versionId } = params

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
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const version = await db.noteVersion.findUnique({
      where: {
        id: versionId,
        noteId: noteId,
      },
    })

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    const latestVersion = await db.noteVersion.findFirst({
      where: { noteId },
      orderBy: {
        versionNumber: 'desc',
      },
    })

    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

    await db.noteVersion.create({
      data: {
        title: `Version ${nextVersionNumber} (Restored to Version ${version.versionNumber})`,
        content: note.content,
        noteId: note.id,
        userId: session.user.id,
        versionNumber: nextVersionNumber,
      },
    })

    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        content: version.content,
      },
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('[RESTORE_VERSION]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
