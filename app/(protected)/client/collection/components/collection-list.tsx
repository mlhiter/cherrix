import { formatDistanceToNow } from 'date-fns'
import { Eye, Trash, RefreshCw, Loader2, Boxes, Cpu, EllipsisVerticalIcon } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { CollectionItem } from '@/types/collection'

interface CollectionListProps {
  items: CollectionItem[]
  onView: (item: CollectionItem) => void
  onDelete: (id: string) => void
  onSync: (id: string) => void
  isLoading?: boolean
}

export function CollectionList({ items, onView, onDelete, onSync, isLoading = false }: CollectionListProps) {
  return (
    <Card className="flex-1 p-4">
      <div className="flex min-h-10 items-center justify-between">
        <h2 className="text-xl font-semibold">List</h2>
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
            className="h-[300px]"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Last Synced</TableHead>
                <TableHead>Vector Status</TableHead>
                <TableHead className="w-[100px]">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => onView(item)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.sourceType}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(item.lastSyncTime), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    {item.isVectorized ? (
                      <Badge variant="secondary" className="gap-1">
                        <Cpu className="h-3 w-3" /> Vectorized
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not Vectorized
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onView(item)
                            }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onSync(item.id)
                            }}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item.id)
                            }}
                            className="text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
