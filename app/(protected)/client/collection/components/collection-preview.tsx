'use client'

import { useEffect, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CollectionItem } from '@/types/collection'

interface CollectionPreviewProps {
  drawerOpen: boolean
  setDrawerOpenAction: (open: boolean) => void
  selectedItem: CollectionItem | null
}

export const CollectionPreview = ({
  drawerOpen,
  setDrawerOpenAction,
  selectedItem,
}: CollectionPreviewProps) => {
  const [collectionWithItems, setCollectionWithItems] =
    useState<CollectionItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCollectionItems = async () => {
      if (!selectedItem) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/collection/${selectedItem.id}/items`)
        const data = await response.json()
        console.log('data', data)

        if (data.success) {
          setCollectionWithItems(data.collection)
        }
      } catch (error) {
        console.error('Failed to fetch collection items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (drawerOpen && selectedItem) {
      fetchCollectionItems()
    }
  }, [drawerOpen, selectedItem])

  return (
    <Drawer
      direction="right"
      open={drawerOpen}
      onOpenChange={setDrawerOpenAction}>
      <DrawerContent className="h-full">
        <div className="flex h-full flex-col">
          <DrawerHeader>
            {selectedItem && <DrawerTitle>{selectedItem.name}</DrawerTitle>}
            <DrawerDescription>
              {selectedItem &&
                `Source Type: ${selectedItem.sourceType} | Last Sync: ${selectedItem.lastSyncTime || 'Never'}`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-auto px-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : collectionWithItems ? (
              <div className="flex flex-col gap-4">
                {collectionWithItems.docItems?.map((item) => (
                  <div key={item.id} className="rounded-md bg-gray-100 p-4">
                    <div className="whitespace-pre-wrap">{item.content}</div>
                  </div>
                ))}
                {collectionWithItems.blogItems?.map((item) => (
                  <div key={item.id} className="rounded-md bg-gray-100 p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="whitespace-pre-wrap">{item.content}</div>
                  </div>
                ))}
                {collectionWithItems.githubItems?.map((item) => (
                  <div key={item.id} className="rounded-md bg-gray-100 p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="whitespace-pre-wrap">{item.content}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
