import { formatDistanceToNow } from 'date-fns'
import { Eye, Trash, RefreshCw, Loader2, Boxes } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'

import { CollectionItem } from '@/types/collection'

interface CollectionListProps {
  items: CollectionItem[]
  onView: (item: CollectionItem) => void
  onDelete: (id: string) => void
  onSync: (id: string) => void
  isLoading?: boolean
}

export function CollectionList({
  items,
  onView,
  onDelete,
  onSync,
  isLoading = false,
}: CollectionListProps) {
  return (
    <Card className="flex-1 p-4">
      <div className="flex min-h-10 items-center justify-between">
        <h2 className="text-xl font-semibold">Collection List</h2>
      </div>
      <div className="w-full">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No Collections"
            description="You haven't created any collections yet. Start by adding a new collection."
            icon={Boxes}
            className="h-[350px]"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead>Last Sync Time</TableHead>
                <TableHead>Sync Frequency</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView(item)}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.sourceType === 'OFFICIAL_DOC'
                      ? 'Official Document'
                      : item.sourceType === 'RSS_BLOG'
                        ? 'RSS Blog'
                        : 'Github'}
                  </TableCell>
                  <TableCell>
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      {item.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.lastSyncTime), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>{item.syncFrequency}</TableCell>
                  <TableCell
                    className="space-x-2"
                    onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(item)}
                      title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSync(item.id)}
                      title="Sync Now">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                      title="Delete">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
