'use client'

import { useState } from 'react'

import { formatDate } from '@/lib/date'
import { MyDocument } from '@/types/document'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { PdfRender } from './pdf-render'

interface FilePreviewProps {
  drawerOpen: boolean
  setDrawerOpenAction: (open: boolean) => void
  selectedDocument: MyDocument | null
}

export const FilePreview = ({
  drawerOpen,
  setDrawerOpenAction,
  selectedDocument,
}: FilePreviewProps) => {
  const renderPreview = () => {
    if (!selectedDocument?.url) return null

    if (selectedDocument.type === 'pdf') {
      return <PdfRender filePath={selectedDocument.path} />
    }

    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        <p>Preview not available for this file type</p>
      </div>
    )
  }

  return (
    <Drawer
      direction="right"
      open={drawerOpen}
      onOpenChange={setDrawerOpenAction}>
      <DrawerContent className="h-full">
        <div className="flex h-full flex-col">
          <DrawerHeader>
            {selectedDocument && (
              <DrawerTitle>{selectedDocument.name}</DrawerTitle>
            )}
            <DrawerDescription>
              {selectedDocument &&
                `Document Type: ${selectedDocument.type} | Import Time: ${selectedDocument.importTime ? formatDate(selectedDocument.importTime) : 'Unknown'}`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-auto px-4">
            {selectedDocument && (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-gray-100 p-2 text-sm">
                  {renderPreview()}
                </div>
              </div>
            )}
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(selectedDocument?.path, '_blank')}>
                Open
              </Button>
              <Button variant="outline">Analyze</Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
