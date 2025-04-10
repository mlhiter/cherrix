import pdf from 'pdf-parse'

import { NextResponse } from 'next/server'

import {
  addDocumentsToVectorStore,
  similaritySearch,
  getCollectionStats,
} from '@/lib/vector-store'
import { minioClient } from '@/lib/minio'
import { processDocument } from '@/lib/document-processor'

export async function POST(req: Request) {
  try {
    const { filePath, fileName, fileType } = await req.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      )
    }

    const dataStream = await minioClient.getObject(
      process.env.MINIO_BUCKET_NAME!,
      filePath
    )

    const chunks: Buffer[] = []
    for await (const chunk of dataStream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    let text: string

    if (fileType === 'pdf') {
      const pdfData = await pdf(buffer)
      text = pdfData.text
    } else {
      text = buffer.toString('utf-8')
    }

    const documents = await processDocument(text, fileName, fileType)
    await addDocumentsToVectorStore(documents)

    return NextResponse.json({
      message: 'Document vectorized successfully',
      chunks: chunks.length,
    })
  } catch (error) {
    console.error('Error vectorizing document:', error)
    return NextResponse.json(
      { error: 'Failed to vectorize document' },
      { status: 500 }
    )
  }
}

// similarity search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')

    if (!query) {
      const stats = await getCollectionStats()
      return NextResponse.json(stats)
    }

    const results = await similaritySearch(query)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching documents:', error)
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
}
