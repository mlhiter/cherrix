import { NextResponse } from 'next/server'
import cron from 'node-cron'
import { CollectionItem } from '@/types/collection'

async function syncCollectionItem(item: CollectionItem) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/collection/fetch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: item.sourceType,
          url: item.originalUrl,
        }),
      }
    )

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/collection/${item.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: result.content,
          metadata: result.metadata,
          lastSyncTime: new Date().toISOString(),
        }),
      }
    )

    console.log(`Successfully synced collection item: ${item.name}`)
  } catch (error) {
    console.error(`Failed to sync collection item ${item.name}:`, error)
  }
}

async function getCollectionsToSync(): Promise<CollectionItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/collection`
    )
    const data = await response.json()
    return data.success ? data.collections : []
  } catch (error) {
    console.error('Failed to fetch collections:', error)
    return []
  }
}

export async function GET(request: Request) {
  // 检查认证头
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.split(' ')[1]
  if (token !== process.env.API_TOKEN) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    )
  }

  try {
    const collections = await getCollectionsToSync()

    for (const item of collections) {
      const now = new Date()
      const lastSync = new Date(item.lastSyncTime)
      const hoursSinceLastSync =
        (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)

      const shouldSync =
        (item.syncFrequency === 'every-day' && hoursSinceLastSync >= 24) ||
        (item.syncFrequency === 'every-week' && hoursSinceLastSync >= 24 * 7) ||
        (item.syncFrequency === 'every-month' && hoursSinceLastSync >= 24 * 30)

      if (shouldSync) {
        console.log(`Syncing collection item: ${item.name}`)
        await syncCollectionItem(item)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to run sync task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run sync task' },
      { status: 500 }
    )
  }
}
