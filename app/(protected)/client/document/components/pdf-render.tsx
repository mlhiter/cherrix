'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export const PdfRender = ({ filePath }: { filePath: string }) => {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [presignedUrl, setPresignedUrl] = useState<string>('')

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  }

  useEffect(() => {
    const getPresignedUrl = async () => {
      const response = await fetch(`/api/document/presigned-url?filePath=${encodeURIComponent(filePath)}`)

      const data = await response.json()
      console.log(data)
      setPresignedUrl(data.url)
    }

    getPresignedUrl()
  }, [filePath])

  return (
    <div className="w-full">
      <Document
        file={presignedUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex h-40 items-center justify-center">
            <p>Loading PDF...</p>
          </div>
        }>
        <Page pageNumber={pageNumber} width={400} height={500} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-gray-600">
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 1)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
