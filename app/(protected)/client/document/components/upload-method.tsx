import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useState, useRef, ChangeEvent } from 'react'

import { Tabs } from '@/components/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const UploadMethod = () => {
  const [urlInput, setUrlInput] = useState('')
  const [activeTab, setActiveTab] = useState('local')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const Icon = ({ name }: { name: string }) => (
    <span className="mr-2">
      {name === 'local' ? '💾' : name === 'link' ? '🔗' : '📤'}
    </span>
  )

  const tabList = [
    { label: 'Local', value: 'local', icon: <Icon name="local" /> },
    { label: 'URL', value: 'url', icon: <Icon name="link" /> },
    {
      label: 'Third-Party',
      value: 'third-party',
      icon: <Icon name="upload" />,
    },
  ]

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast('Please select a file to upload', {
        description: 'Please select a file to upload',
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/s3/upload-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const data = await response.json()

      toast.success(`File ${data.originalName} has been uploaded successfully`)

      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error((error as Error).message || 'Some error occurred')
    } finally {
      setIsUploading(false)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    }
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
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabList={tabList}
        />

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
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-40">
                    Choose File
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-40">
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
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
                {uploadProgress > 0 && (
                  <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Supports PDF, Word, Excel, Markdown, TXT format files.
              </p>
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
