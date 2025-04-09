'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Header } from '@/components/header'
import { FilePreview } from './components/file-preview'
import { UploadMethod } from './components/upload-method'
import { DocumentList } from './components/document-list'

import { MyDocument } from '@/types/document'

export default function DocumentPage() {
  const [selectedDocument, setSelectedDocument] = useState<null | MyDocument>(
    null
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [documents, setDocuments] = useState<MyDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/document')

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
      } else {
        throw new Error(data.error || 'Failed to fetch documents')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to fetch documents')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      })

      if (!response.ok) {
        toast.error('Failed to delete document')
        return
      }

      const data = await response.json()

      if (data.success) {
        toast.success('Document deleted successfully')
        fetchDocuments()
      } else {
        toast.error(data.error || 'Failed to delete document')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete document')
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="Document"
        description="Documents are static files that you collect manually and are not automatically updated. "
      />

      <div className="flex h-full gap-6">
        <div className="flex w-full flex-col gap-6">
          {/* Import Method Tabs */}
          <UploadMethod onUploadSuccess={fetchDocuments} />
          {/* Document List Card */}
          <DocumentList
            documents={documents}
            setSelectedDocument={setSelectedDocument}
            setDrawerOpen={setDrawerOpen}
            isLoading={isLoading}
            onDelete={deleteDocument}
          />
        </div>
      </div>

      {/*File Preview Drawer */}
      <FilePreview
        drawerOpen={drawerOpen}
        setDrawerOpenAction={setDrawerOpen}
        selectedDocument={selectedDocument}
      />
    </div>
  )
}
