import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

import { Document } from '@langchain/core/documents'

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 100

interface DocumentMetadata {
  source: string
  type: string
  created_at: string
  [key: string]: unknown
}

export async function splitTextIntoChunks(text: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '。', '，', ' ', ''],
  })

  return await splitter.createDocuments([text])
}

export function processMetadata(fileName: string, fileType: string) {
  return {
    source: fileName,
    type: fileType,
    created_at: new Date().toISOString(),
  }
}

export function enrichDocumentsWithMetadata(
  documents: Document[],
  metadata: DocumentMetadata
): Document[] {
  return documents.map((doc) => {
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        ...metadata,
      },
    }
  })
}

export async function processDocument(
  text: string,
  fileName: string,
  fileType: string
): Promise<Document[]> {
  const chunks = await splitTextIntoChunks(text)

  const metadata = processMetadata(fileName, fileType)

  return enrichDocumentsWithMetadata(chunks, metadata)
}
