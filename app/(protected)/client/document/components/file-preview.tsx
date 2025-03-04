import { useState } from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

import { Document } from '@/types/document'

interface FilePreviewProps {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  selectedDocument: Document | null
}

export const FilePreview = ({
  drawerOpen,
  setDrawerOpen,
  selectedDocument,
}: FilePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerContent className="h-full">
        <div className="flex h-full flex-col">
          <DrawerHeader>
            {selectedDocument && (
              <DrawerTitle>{selectedDocument.name}</DrawerTitle>
            )}
            <DrawerDescription>
              {selectedDocument &&
                `文档类型: ${selectedDocument.type} | 导入时间: ${selectedDocument.importTime}`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-auto px-4">
            {selectedDocument ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md bg-gray-100 p-4 text-sm">
                  <div className="mt-2">
                    <h4 className="font-medium">文档内容预览</h4>
                    <p className="mt-2 text-gray-600">
                      {selectedDocument.type === 'pdf'
                        ? '这里是PDF文档的预览内容...'
                        : selectedDocument.type === 'excel'
                          ? '这里是Excel表格的预览内容...'
                          : '这里是文档的预览内容...'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-gray-500">
                <p>选择一个文档查看详情</p>
              </div>
            )}
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button>打开</Button>
              <Button variant="outline">分析</Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
