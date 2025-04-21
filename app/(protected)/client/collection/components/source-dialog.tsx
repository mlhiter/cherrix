import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CollectionSource } from '@/types/collection'

interface SourceDialogProps {
  source: CollectionSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; url: string; syncFrequency: string }) => void
}

export function SourceDialog({ source, open, onOpenChange, onSubmit }: SourceDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [syncFrequency, setSyncFrequency] = useState('every-day')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ name, url, syncFrequency })
      setName('')
      setUrl('')
      setSyncFrequency('every-day')
    } catch (error) {
      console.error('Failed to submit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!source) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {source.name} Collection Source</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give this collection source a name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">
              {source.type === 'OFFICIAL_DOC'
                ? 'Document URL'
                : source.type === 'RSS_BLOG'
                  ? 'RSS Feed URL'
                  : 'Github Repository URL'}
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                source.type === 'OFFICIAL_DOC'
                  ? 'Enter Document URL'
                  : source.type === 'RSS_BLOG'
                    ? 'Enter RSS Feed URL'
                    : 'Enter Github Repository URL'
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Sync Frequency</Label>
            <Select value={syncFrequency} onValueChange={(value) => setSyncFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sync Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="every-day">Every Day</SelectItem>
                <SelectItem value="every-week">Every Week</SelectItem>
                <SelectItem value="every-month">Every Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Confirm Add'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
