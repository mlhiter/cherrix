import {
  EllipsisVerticalIcon,
  ListCollapse,
  Trash,
  Loader2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatDate } from '@/lib/date'
import { MyDocument } from '@/types/document'

interface DocumentListProps {
  documents: MyDocument[]
  setSelectedDocument: (document: MyDocument) => void
  setDrawerOpen: (open: boolean) => void
  isLoading?: boolean
  onDelete?: (documentId: string) => void
}

export const DocumentList = ({
  documents,
  setSelectedDocument,
  setDrawerOpen,
  isLoading = false,
  onDelete,
}: DocumentListProps) => {
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
        ) : documents.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No documents found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Import Time</TableHead>
                <TableHead>Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedDocument(doc)
                    setDrawerOpen(true)
                  }}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>
                    {doc.importTime ? formatDate(doc.importTime) : '-'}
                  </TableCell>
                  <TableCell>
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
                            setSelectedDocument(doc)
                            setDrawerOpen(true)
                          }}>
                          <ListCollapse className="mr-2 h-4 w-4" />
                          Detail
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(doc.id)
                            }}
                            className="text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
