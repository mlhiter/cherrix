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

    const versions = await db.noteVersion.findMany({
      where: {
        noteId,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error('[NOTE_VERSIONS_GET]', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
