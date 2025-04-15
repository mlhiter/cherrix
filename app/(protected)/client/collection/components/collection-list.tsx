import { formatDistanceToNow } from 'date-fns'
import { Eye, Trash, RefreshCw } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source Type</TableHead>
          <TableHead>Original URL</TableHead>
          <TableHead>Last Sync Time</TableHead>
          <TableHead>Sync Frequency</TableHead>
          <TableHead>Actions</TableHead>
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
        {items.length === 0 && !isLoading && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
