'use client'

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
            {selectedItem && (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-gray-100 p-4">
                  <div className="whitespace-pre-wrap">
                    {selectedItem.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
