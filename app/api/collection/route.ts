import { NextResponse } from 'next/server'
import { CollectionItem } from '@/types/collection'

let collections: CollectionItem[] = [
  {
    id: '1',
    name: 'React Documentation',
    sourceType: 'OFFICIAL_DOC',
    originalUrl: 'https://react.dev',
    lastSyncTime: '2024-03-20T10:00:00Z',
    syncFrequency: 'every-day',
    content: 'React is a JavaScript library for building user interfaces...',
  },
  {
    id: '2',
    name: 'Next.js Blog',
    sourceType: 'RSS_BLOG',
    originalUrl: 'https://nextjs.org/blog',
    lastSyncTime: '2024-03-20T09:00:00Z',
    syncFrequency: 'every-week',
    content: 'Latest updates and announcements from the Next.js team...',
  },
]

// GET /api/collection
export async function GET() {
  return NextResponse.json({ success: true, collections })
}

// POST /api/collection
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newCollection: CollectionItem = {
      id: Date.now().toString(),
      ...body,
      lastSyncTime: new Date().toISOString(),
    }
    collections.push(newCollection)
    return NextResponse.json({ success: true, collection: newCollection })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create collection' },
      { status: 400 }
    )
  }
}

// DELETE /api/collection
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    collections = collections.filter((item) => item.id !== id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete collection' },
      { status: 400 }
    )
  }
}
