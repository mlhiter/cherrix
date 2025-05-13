import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { addDocumentsToVectorStore } from '@/lib/vector-store'
import { processCollectionContent } from '@/lib/collection-processor'
import { CollectionItem } from '@/types/collection'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { collectionId } = await req.json()

    if (!collectionId) {
      return NextResponse.json({ error: 'No collection ID provided' }, { status: 400 })
    }

    const collection = await db.collection.findUnique({
      where: {
        id: collectionId,
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
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    const collectionItem: CollectionItem = {
      id: collection.id,
      name: collection.name,
      sourceType: collection.sourceType,
      originalUrl: collection.originalUrl,
      syncFrequency: collection.syncFrequency as 'daily' | 'weekly' | 'monthly',
      lastSyncTime: new Date(collection.lastSyncTime),
      userId: collection.userId,
      isVectorized: Boolean(collection.isVectorized),
      docItems: collection.docItems.map((item) => ({
        ...item,
        lastSyncTime: new Date(item.lastSyncTime),
        content: item.content || '',
      })),
      blogItems: collection.blogItems.map((item) => ({
        ...item,
        lastSyncTime: new Date(item.lastSyncTime),
        publishDate: item.publishDate ? new Date(item.publishDate) : new Date(),
        content: item.content || '',
      })),
      githubItems: collection.githubItems.map((item) => ({
        ...item,
        lastSyncTime: new Date(item.lastSyncTime),
      })),
    }

    const documents = await processCollectionContent(collectionItem)

    if (documents.length === 0) {
      return NextResponse.json({ error: 'No content to vectorize' }, { status: 400 })
    }

    await addDocumentsToVectorStore(documents)

    await db.collection.update({
      where: { id: collectionId },
      data: { isVectorized: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Collection vectorized successfully',
      documentCount: documents.length,
    })
  } catch (error) {
    console.error('Error vectorizing collection:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to vectorize collection',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check vectorization status
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const collectionId = searchParams.get('collectionId')

    if (!collectionId) {
      return NextResponse.json({ error: 'No collection ID provided' }, { status: 400 })
    }

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const collection = await db.collection.findUnique({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      isVectorized: collection.isVectorized,
      collection: {
        id: collection.id,
        name: collection.name,
      },
    })
  } catch (error) {
    console.error('Error checking vectorization status:', error)
    return NextResponse.json({ error: 'Failed to check vectorization status' }, { status: 500 })
  }
}
