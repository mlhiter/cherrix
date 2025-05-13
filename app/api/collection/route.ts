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
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name, sourceType, originalUrl, syncFrequency, content, metadata, items } = await request.json()

    // Check if the collection with the same URL already exists
    const existingCollection = await db.collection.findFirst({
      where: {
        originalUrl,
        userId: session.user.id,
      },
    })

    if (existingCollection) {
      return NextResponse.json({ success: false, error: 'Collection with this URL already exists' }, { status: 400 })
    }

    // Create collection based on source type
    const collection = await db.collection.create({
      data: {
        name,
        sourceType: sourceType as SourceType,
        originalUrl,
        syncFrequency,
        lastSyncTime: new Date(),
        userId: session.user.id as string,
      },
    })

    // Create related items based on source type
    switch (sourceType) {
      case 'OFFICIAL_DOC': {
        const images =
          metadata.images?.map((img: any) => ({
            url: img.url,
            alt: img.alt || '',
          })) || []

        const tableOfContentsItems =
          metadata.tableOfContents?.map((toc: any) => ({
            text: toc.text,
            url: toc.url,
            level: toc.level,
          })) || []

        await db.docItem.create({
          data: {
            ...metadata,
            content: content,
            textContent: content.textContent,
            lastSyncTime: new Date(),
            collectionId: collection.id,
            images: {
              create: images,
            },
            tableOfContents: {
              create: tableOfContentsItems,
            },
          },
        })
        break
      }
      case 'RSS_BLOG':
        await db.blogItem.createMany({
          data: items.map((item: any) => ({
            title: item.title,
            url: item.url,
            content: item.content,
            publishDate: item.publishDate,
            author: item.author,
            collectionId: collection.id,
            lastSyncTime: item.lastSyncTime,
          })),
        })
        break
      case 'GITHUB':
        await db.githubItem.create({
          data: {
            name: metadata.name || 'GitHub Repository',
            url: metadata.url,
            readme: content,
            description: metadata.description,
            stars: metadata.stars,
            forks: metadata.forks,
            language: metadata.language,
            topics: [],
            lastSyncTime: new Date(),
            collectionId: collection.id,
          },
        })
        break
    }

    try {
      const fullCollection = await db.collection.findUnique({
        where: { id: collection.id },
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

      if (fullCollection) {
        const vectorizeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection/vectorize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collectionId: collection.id,
          }),
        })

        if (vectorizeResponse.ok) {
          await db.collection.update({
            where: { id: collection.id },
            data: { isVectorized: true },
          })
        }
      }
    } catch (vectorizeError) {
      console.error('Auto-vectorization failed:', vectorizeError)
    }

    return NextResponse.json({ success: true, collection })
  } catch (error) {
    console.error('Failed to create collection', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to create collection' },
      { status: 500 }
    )
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
