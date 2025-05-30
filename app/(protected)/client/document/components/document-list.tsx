import { EllipsisVerticalIcon, ListCollapse, Trash, Loader2, File } from 'lucide-react'
import Image from 'next/image'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { formatDate } from '@/lib/date'
import { MyDocument } from '@/types/document'
import { DocumentVectorize } from './document-vectorize'
import { EmptyState } from '@/components/empty-state'

interface DocumentListProps {
  documents: MyDocument[]
  setSelectedDocument: (document: MyDocument) => void
  setDrawerOpen: (open: boolean) => void
  isLoading?: boolean
  onDelete?: (documentId: string) => void
}

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase()

  switch (true) {
    case type.includes('pdf'):
      return <Image src="/icons/pdf.svg" alt="pdf" width={16} height={16} />
    case type.includes('doc') || type.includes('docx') || type.includes('txt'):
      return <Image src="/icons/doc.svg" alt="doc" width={16} height={16} />
    case type.includes('excel'):
      return <Image src="/icons/excel.svg" alt="excel" width={16} height={16} />
    default:
      return <File className="h-4 w-4 text-gray-500" />
  }
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
          <EmptyState
            title="No Documents"
            description="No documents found in this collection. Documents will appear here once they are added."
            icon={File}
            className="h-[300px]"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vector Status</TableHead>
                <TableHead>Import Time</TableHead>
                <TableHead className="w-[100px]">Operation</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {getFileIcon(doc.type)}
                      <span className="text-xs uppercase">{doc.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <DocumentVectorize document={doc} displayAsBadge={true} />
                    </div>
                  </TableCell>
                  <TableCell>{doc.importTime ? formatDate(doc.importTime) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
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
