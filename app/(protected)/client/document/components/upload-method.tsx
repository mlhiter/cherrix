import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useState, useRef, ChangeEvent } from 'react'

import { Tabs } from '@/components/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface UploadMethodProps {
  onUploadSuccess?: () => void
}

export const UploadMethod = ({ onUploadSuccess }: UploadMethodProps) => {
  const [urlInput, setUrlInput] = useState('')
  const [activeTab, setActiveTab] = useState('local')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabList = [
    { label: 'Local', value: 'local', icon: <span className="mr-2">💾</span> },
    { label: 'URL', value: 'url', icon: <span className="mr-2">🔗</span> },
    {
      label: 'Third-Party',
      value: 'third-party',
      icon: <span className="mr-2">📤</span>,
    },
  ]

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch('/api/document/upload-file', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'upload failed')
      }

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Upload successful')

      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (error) {
      toast.error((error as Error).message || 'upload failed')
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid document URL')
      return
    }

    toast.info('This feature is under development')
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabList={tabList} />

        <div className="mt-4">
          {activeTab === 'local' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleFileUpload} className="w-40">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload File'
                    )}
                  </Button>
                </div>
                {selectedFile && (
                  <div className="text-sm">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2.5 w-full" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Supports PDF, Word, Excel, Markdown, TXT format files.</p>
            </div>
          )}
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter document URL"
                  className="w-full"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Button onClick={handleUrlImport}>Import</Button>
              </div>
            </div>
          )}
          {activeTab === 'third-party' && (
            <div className="flex gap-4">
              <Button variant="outline">Google Drive</Button>
              <Button variant="outline">Dropbox</Button>
              <Button variant="outline">OneDrive</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
