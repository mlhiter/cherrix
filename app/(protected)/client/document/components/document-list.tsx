import { EllipsisVerticalIcon, ListCollapse, Trash } from 'lucide-react'

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

import { Document } from '@/types/document'

interface DocumentListProps {
  documents: Document[]
  setSelectedDocument: (document: Document) => void
  setDrawerOpen: (open: boolean) => void
}

export const DocumentList = ({
  documents,
  setSelectedDocument,
  setDrawerOpen,
}: DocumentListProps) => {
  return (
    <Card className="flex-1 p-4">
      <div className="flex min-h-10 items-center justify-between">
        <h2 className="text-xl font-semibold">List</h2>
      </div>
      <div className="w-full">
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
                <TableCell>{doc.importTime}</TableCell>
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
                      <DropdownMenuItem
                        onClick={(e) => e.stopPropagation()}
                        className="text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
