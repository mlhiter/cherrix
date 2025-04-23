import { NextResponse } from 'next/server'
import { startSyncJob, stopSyncJob } from '@/services/sync/sync-service'

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
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: we need to zod validate the request body nad fetch
    const { name, sourceType, originalUrl, syncFrequency, items } = await request.json()

    const newCollection = await db.collection.create({
      data: {
        name,
        sourceType: sourceType as SourceType,
        originalUrl,
        syncFrequency,
        userId: session.user.id!,
        lastSyncTime: new Date(),
      },
    })

    if (items && items.length > 0) {
      switch (sourceType) {
        case 'OFFICIAL_DOC':
          await db.docItem.createMany({
            data: items.map((item: any) => ({
              ...item,
              collectionId: newCollection.id,
              lastSyncTime: new Date(),
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
          await db.githubItem.createMany({
            data: items.map((item: any) => ({
              ...item,
              collectionId: newCollection.id,
              lastSyncTime: new Date(),
            })),
          })
          break
      }
    }

    startSyncJob({
      id: newCollection.id,
      sourceType: newCollection.sourceType,
      originalUrl: newCollection.originalUrl,
      syncFrequency: 'every-day',
    })

    return NextResponse.json({ success: true, collection: newCollection })
  } catch (error) {
    console.error('Failed to create collection', error)
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

    stopSyncJob(id)

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

// PUT /api/collection
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id, content, metadata, items } = await request.json()

    const collection = await db.collection.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        lastSyncTime: new Date(),
      },
    })

    switch (collection.sourceType) {
      case 'OFFICIAL_DOC':
        await db.docItem.deleteMany({
          where: {
            collectionId: id,
          },
        })
        if (items && items.length > 0) {
          await db.docItem.createMany({
            data: items.map((item: any) => ({
              ...item,
              collectionId: id,
              lastSyncTime: new Date(),
            })),
          })
        }
        break
      case 'RSS_BLOG':
        await db.blogItem.deleteMany({
          where: {
            collectionId: id,
          },
        })
        if (items && items.length > 0) {
          await db.blogItem.createMany({
            data: items.map((item: any) => ({
              title: item.title,
              url: item.url,
              content: item.content,
              publishDate: item.publishDate,
              author: item.author,
              collectionId: id,
              lastSyncTime: new Date(),
            })),
          })
        }
        break
      case 'GITHUB':
        await db.githubItem.deleteMany({
          where: {
            collectionId: id,
          },
        })
        if (items && items.length > 0) {
          await db.githubItem.createMany({
            data: items.map((item: any) => ({
              ...item,
              collectionId: id,
              lastSyncTime: new Date(),
            })),
          })
        }
        break
    }

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Failed to update collection:', error)
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 })
  }
}
