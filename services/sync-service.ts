import { CollectionItem } from '@/types/collection'

async function syncCollectionItem(item: CollectionItem) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceType: item.sourceType,
        url: item.originalUrl,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: result.content,
        metadata: result.metadata,
        lastSyncTime: new Date().toISOString(),
      }),
    })

    try {
      const vectorizeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection/vectorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: item.id,
        }),
      })

      if (!vectorizeResponse.ok) {
        console.error(`Failed to vectorize collection ${item.name}:`, await vectorizeResponse.text())
      }
    } catch (vectorizeError) {
      console.error(`Failed to vectorize collection ${item.name}:`, vectorizeError)
    }

    console.log(`Successfully synced collection item: ${item.name}`)
  } catch (error) {
    console.error(`Failed to sync collection item ${item.name}:`, error)
  }
}

async function getCollectionsToSync(): Promise<CollectionItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection`)
    const data = await response.json()
    return data.success ? data.collections : []
  } catch (error) {
    console.error('Failed to fetch collections:', error)
    return []
  }
}

export async function syncCollection(collectionId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collection/${collectionId}`)
    const data = await response.json()

    if (data.success && data.collection) {
      await syncCollectionItem(data.collection)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to sync collection:', error)
    return false
  }
}
