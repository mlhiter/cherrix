import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, RotateCcw, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { PartialBlock } from '@blocknote/core'

interface Version {
  id: string
  title: string
  content: string
  versionNumber: number
  createdAt: string
  userId: string
}

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId: string
  onVersionRestore: (content: string) => void
}

export function VersionHistoryDialog({ open, onOpenChange, noteId, onVersionRestore }: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const previewEditor = useCreateBlockNote({
    initialContent: previewVersion?.content
      ? (JSON.parse(previewVersion.content) as PartialBlock[])
      : [
          {
            type: 'paragraph',
            content: 'Select a version to preview',
          },
        ],
  })

  useEffect(() => {
    if (previewVersion?.content && previewEditor) {
      try {
        const content = JSON.parse(previewVersion.content) as PartialBlock[]
        if (content && content.length > 0) {
          previewEditor.replaceBlocks(previewEditor.document, content)
        }
      } catch (error) {
        console.error('Error parsing preview content:', error)
      }
    }
  }, [previewVersion, previewEditor])

  useEffect(() => {
    if (open && noteId) {
      fetchVersions()
    } else {
      setShowPreview(false)
      setPreviewVersion(null)
    }
  }, [open, noteId])

  const fetchVersions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/note/${noteId}/versions`)
      if (!response.ok) {
        toast.error('Failed to fetch version history')
        return
      }
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      console.error('Error fetching versions:', error)
      toast.error('Failed to fetch version history')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewVersion = (version: Version) => {
    setPreviewVersion(version)
    setShowPreview(true)
  }

  const handleRestoreVersion = async (versionId: string) => {
    try {
      setIsRestoring(true)
      setSelectedVersionId(versionId)

      const response = await fetch(`/api/note/${noteId}/versions/${versionId}/restore`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('restore version failed')
      }

      const data = await response.json()
      onVersionRestore(data.content)

      toast.success('Successfully restored to the previous version')
      onOpenChange(false)
    } catch (error) {
      console.error('Error restoring version:', error)
      toast.error('Failed to restore version')
    } finally {
      setIsRestoring(false)
      setSelectedVersionId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <p className="text-muted-foreground">No version history yet</p>
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-hidden">
            <div className="w-1/2 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Created Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id} className={previewVersion?.id === version.id ? 'bg-muted' : ''}>
                      <TableCell>{version.title}</TableCell>
                      <TableCell>{format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePreviewVersion(version)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleRestoreVersion(version.id)}
                            disabled={isRestoring}>
                            {isRestoring && selectedVersionId === version.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                            Restore
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="w-1/2 overflow-auto rounded-md border">
              {showPreview && previewVersion ? (
                <div className="p-4">
                  <h3 className="mb-2 text-sm font-medium">{previewVersion.title}</h3>
                  <div className="border-t pt-2">
                    <BlockNoteView editor={previewEditor} theme="light" editable={false} />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>Select a version to preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
