import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    if (open && noteId) {
      fetchVersions()
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
      <DialogContent className="max-w-3xl">
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
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Created Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>{version.title}</TableCell>
                    <TableCell>{format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
