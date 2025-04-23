import { Cron } from 'croner'
import { CollectionItem } from '@/types/collection'

const activeJobs = new Map<string, Cron>()

function getCronExpression(frequency: string): string {
  switch (frequency) {
    case 'every-day':
      return '0 0 * * *'
    case 'every-week':
      return '0 0 * * 0'
    case 'every-month':
      return '0 0 1 * *'
    default:
      return '0 0 * * *'
  }
}

export function startSyncJob(item: Pick<CollectionItem, 'id' | 'sourceType' | 'originalUrl' | 'syncFrequency'>) {
  stopSyncJob(item.id)

  const cronExpression = getCronExpression(item.syncFrequency)

  const job = new Cron(cronExpression, async () => {
    try {
      const response = await fetch('/api/collection/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          sourceType: item.sourceType,
          originalUrl: item.originalUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error(`Failed to sync collection ${item.id}:`, error)
    }
  })

  activeJobs.set(item.id, job)
}

export function stopSyncJob(id: string) {
  const job = activeJobs.get(id)
  if (job) {
    job.stop()
    activeJobs.delete(id)
  }
}

export function initializeSyncJobs(items: CollectionItem[]) {
  items.forEach((item) => {
    startSyncJob({
      id: item.id,
      sourceType: item.sourceType,
      originalUrl: item.originalUrl,
      syncFrequency: item.syncFrequency,
    })
  })
}

export async function syncCollection(id: string): Promise<boolean> {
  try {
    // 1. fetch collection details
    const collectionResponse = await fetch(`/api/collection/${id}`)
    if (!collectionResponse.ok) {
      throw new Error('Failed to fetch collection details')
    }
    const collectionData = await collectionResponse.json()
    if (!collectionData.success) {
      throw new Error(collectionData.error || 'Failed to fetch collection details')
    }

    // 2. fetch content
    const collection = collectionData.collection

    const fetchResponse = await fetch('/api/collection/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceType: collection.sourceType,
        url: collection.originalUrl,
      }),
    })

    const fetchResult = await fetchResponse.json()
    if (!fetchResult.success) {
      throw new Error(fetchResult.error || 'Failed to fetch content')
    }

    const updateResponse = await fetch('/api/collection', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: collection.id,
        content: fetchResult.content,
        metadata: fetchResult.metadata,
        items: fetchResult.items,
      }),
    })

    return updateResponse.ok
  } catch (error) {
    console.error(`Failed to sync collection ${id}:`, error)
    return false
  }
}
