import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { CollectionItem, DocItem, BlogItem, GithubItem } from '@/types/collection'

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 100

export async function splitTextIntoChunks(text: string): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '。', '，', ' ', ''],
  })

  return await splitter.createDocuments([text])
}

export function processMetadata(
  collectionId: string,
  collectionName: string,
  itemTitle: string,
  itemUrl: string,
  sourceType: string
) {
  return {
    collection_id: collectionId,
    collection_name: collectionName,
    source_type: sourceType,
    title: itemTitle,
    url: itemUrl,
    created_at: new Date().toISOString(),
  }
}

export function enrichDocumentsWithMetadata(documents: Document[], metadata: Record<string, any>): Document[] {
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

export async function processCollectionContent(collection: CollectionItem): Promise<Document[]> {
  const allDocuments: Document[] = []
  console.log(collection)

  // Process doc items
  if (collection.docItems && collection.docItems.length > 0) {
    for (const item of collection.docItems) {
      if (item.content) {
        const chunks = await splitTextIntoChunks(item.content)
        const metadata = processMetadata(collection.id, collection.name, item.title, item.url, 'OFFICIAL_DOC')
        const enrichedChunks = enrichDocumentsWithMetadata(chunks, metadata)
        allDocuments.push(...enrichedChunks)
      }
    }
  }

  // Process blog items
  if (collection.blogItems && collection.blogItems.length > 0) {
    for (const item of collection.blogItems) {
      if (item.content) {
        const chunks = await splitTextIntoChunks(item.content)
        const metadata = processMetadata(collection.id, collection.name, item.title, item.url, 'RSS_BLOG')
        const enrichedChunks = enrichDocumentsWithMetadata(chunks, metadata)
        allDocuments.push(...enrichedChunks)
      }
    }
  }

  // Process github items
  if (collection.githubItems && collection.githubItems.length > 0) {
    for (const item of collection.githubItems) {
      if (item.readme) {
        const chunks = await splitTextIntoChunks(item.readme)
        const metadata = processMetadata(collection.id, collection.name, item.name, item.url, 'GITHUB')
        const enrichedChunks = enrichDocumentsWithMetadata(chunks, metadata)
        allDocuments.push(...enrichedChunks)
      }
    }
  }

  return allDocuments
}
