import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { SourceType } from '@prisma/client'

// GET /api/collection
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await db.collection.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, collections })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch collections' }, { status: 500 })
  }
}

// POST /api/collection
export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user || !session.user.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // TODO: we need to zod validate the request body nad fetch
    const { name, sourceType, originalUrl, syncFrequency, items, content, metadata } = await request.json()

    // Check if a collection with the same originalUrl and userId already exists
    const existingCollection = await db.collection.findUnique({
      where: {
        originalUrl_userId: {
          originalUrl,
          userId: session.user.id,
        },
      },
    })

    if (existingCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection with this original URL already exists for the user.' },
        { status: 409 }
      )
    }

    const newCollection = await db.collection.create({
      data: {
        name,
        sourceType: sourceType as SourceType,
        originalUrl,
        syncFrequency,
        userId: session.user.id,
        lastSyncTime: new Date(),
      },
    })

    if ((items && items.length > 0) || content) {
      switch (sourceType) {
        case 'OFFICIAL_DOC':
          await db.docItem.createMany({
            data: items.map((item: any) => ({
              ...item,
              collectionId: newCollection.id,
            })),
          })
          break
        case 'RSS_BLOG':
          await db.blogItem.createMany({
            data: items.map((item: any) => ({
              title: item.title,
              url: item.url,
              content: item.content,
              publishDate: item.publishDate,
              author: item.author,
              collectionId: newCollection.id,
              lastSyncTime: item.lastSyncTime,
            })),
          })
          break
        case 'GITHUB':
          await db.githubItem.create({
            data: {
              ...metadata,
              readme: content,
              collectionId: newCollection.id,
            },
          })
          break
      }
    }

    return NextResponse.json({ success: true, collection: newCollection })
  } catch (error) {
    console.error('Failed to create collection', error)
    if (error instanceof Error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A collection with this unique identifier already exists.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 })
  }
}

// DELETE /api/collection
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    await db.collection.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete collection' }, { status: 500 })
  }
}
