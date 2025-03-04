'use client'

import { useState } from 'react'

import { Header } from '@/components/header'
import { FilePreview } from './components/file-preview'
import { UploadMethod } from './components/upload-method'
import { DocumentList } from './components/document-list'

import { Document } from '@/types/document'

// 模拟数据
const mockDocuments = [
  { id: '1', name: '项目计划书.pdf', type: 'pdf', importTime: '2023-12-01' },
  { id: '2', name: '数据分析.xlsx', type: 'excel', importTime: '2023-12-05' },
  { id: '3', name: '会议记录.docx', type: 'word', importTime: '2023-12-10' },
  { id: '4', name: '研究报告.md', type: 'md', importTime: '2023-12-15' },
]

export default function DocumentPage() {
  const [selectedDocument, setSelectedDocument] = useState<null | Document>(
    null
  )
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-full flex-col gap-6">
      <Header
        title="Document"
        description="Documents are static files that you collect manually and are not automatically updated. "
      />

      <div className="flex h-full gap-6">
        <div className="flex w-full flex-col gap-6">
          {/* Import Method Tabs */}
          <UploadMethod />
          {/* Document List Card */}
          <DocumentList
            documents={mockDocuments}
            setSelectedDocument={setSelectedDocument}
            setDrawerOpen={setDrawerOpen}
          />
        </div>
      </div>

      {/*File Preview Drawer */}
      <FilePreview
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedDocument={selectedDocument}
      />
    </div>
  )
}
