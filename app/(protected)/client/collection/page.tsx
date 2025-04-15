'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Header } from '@/components/header'
import { SourceList } from './components/source-list'
import { SourceDialog } from './components/source-dialog'
import { CollectionList } from './components/collection-list'
import { CollectionPreview } from './components/collection-preview'

import { syncCollection } from '@/services/sync-service'
import { CollectionSource, CollectionItem } from '@/types/collection'

export default function CollectionPage() {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null)
  const [selectedSource, setSelectedSource] = useState<CollectionSource | null>(
    null
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())

  const fetchCollections = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/collection')
      const data = await response.json()

      if (data.success) {
        setItems(data.collections)
      } else {
        throw new Error(data.error || 'Failed to fetch collections')
      }
    } catch (error) {
      toast.error('Failed to fetch collections')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSourceSelect = (source: CollectionSource) => {
    setSelectedSource(source)
    setIsDialogOpen(true)
  }

  // TODO: Ensure the same originalUrl can only be added once
  const handleSourceSubmit = async (data: {
    name: string
    url: string
    syncFrequency: string
  }) => {
    if (!selectedSource) return

    try {
      // 1. fetch content
      const fetchResponse = await fetch('/api/collection/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: selectedSource.type,
          url: data.url,
        }),
      })

      const fetchResult = await fetchResponse.json()

      if (!fetchResult.success) {
        throw new Error(fetchResult.error || 'Failed to fetch content')
      }

      // 2. create collection item
      const createResponse = await fetch('/api/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          sourceType: selectedSource.type,
          originalUrl: data.url,
          syncFrequency: data.syncFrequency,
          content: fetchResult.content,
          metadata: fetchResult.metadata,
          items: fetchResult.items,
        }),
      })

      const createResult = await createResponse.json()

      if (createResult.success) {
        toast.success('Added Collection Successfully')
        setIsDialogOpen(false)
        fetchCollections()
      } else {
        throw new Error(createResult.error || 'Failed to add collection')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to add collection')
    }
  }

  const handleViewItem = (item: CollectionItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch('/api/collection', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Deleted Collection Successfully')
        fetchCollections()
      } else {
        throw new Error(data.error || 'Failed to delete collection')
      }
    } catch (error) {
      toast.error('Failed to delete collection')
    }
  }

  const handleSync = async (id: string) => {
    try {
      setSyncingIds((prev) => new Set(prev).add(id))
      const success = await syncCollection(id)

      if (success) {
        toast.success('Synced Collection Successfully')
        fetchCollections()
      } else {
        throw new Error('Failed to sync collection')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to sync collection')
    } finally {
      setSyncingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="Collection"
        description="Collect and sync content from different sources, including official documents, RSS blogs, and Github repositories."
      />

      <div className="flex flex-col gap-8">
        {/* Source List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Source List</h2>
          <SourceList onSourceSelect={handleSourceSelect} />
        </div>

        {/* Collection List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Collection List</h2>
          <CollectionList
            items={items}
            onView={handleViewItem}
            onDelete={handleDeleteItem}
            onSync={handleSync}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Source Dialog */}
      <SourceDialog
        source={selectedSource}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSourceSubmit}
      />

      {/* Collection Preview Drawer */}
      <CollectionPreview
        drawerOpen={isDrawerOpen}
        setDrawerOpenAction={setIsDrawerOpen}
        selectedItem={selectedItem}
      />
    </div>
  )
}
