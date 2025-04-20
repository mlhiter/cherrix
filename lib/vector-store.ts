import { ChromaClient } from 'chromadb'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import { Chroma } from '@langchain/community/vectorstores/chroma'

// Do not use pnpm in nextjs 15.4.0
// https://github.com/huggingface/transformers.js/issues/210

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.EMBEDDING_MODEL_ID,
  configuration: {
    baseURL: process.env.OPENAI_API_URL,
  },
  maxConcurrency: 5,
  timeout: 30000,
  stripNewLines: true,
})

const client = new ChromaClient({
  path: process.env.CHROMA_SERVER_URL,
})

const collectionOptions = {
  collectionName: process.env.CHROMA_COLLECTION_NAME,
  url: process.env.CHROMA_SERVER_URL,
  collectionMetadata: {
    'hnsw:space': 'cosine',
  },
}

export async function getVectorStore() {
  try {
    return await Chroma.fromExistingCollection(embeddings, collectionOptions)
  } catch (error) {
    console.warn('Collection not found, creating new one...')
    return await Chroma.fromDocuments([], embeddings, collectionOptions)
  }
}

export async function addDocumentsToVectorStore(documents: Document[]) {
  const store = await Chroma.fromDocuments(
    documents,
    embeddings,
    collectionOptions
  )
  return store
}

export async function similaritySearch(query: string, k: number = 4) {
  const store = await getVectorStore()
  return await store.similaritySearch(query, k)
}

export async function deleteCollection() {
  try {
    await client.deleteCollection({
      name: process.env.CHROMA_COLLECTION_NAME!,
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
  }
}

export async function getCollectionStats() {
  try {
    const collection = await client.getOrCreateCollection({
      name: process.env.CHROMA_COLLECTION_NAME!,
    })
    const count = await collection.count()

    return {
      documentCount: count,
      collectionName: process.env.CHROMA_COLLECTION_NAME,
    }
  } catch (error) {
    console.error('Error getting collection stats:', error)
    return {
      documentCount: 0,
      collectionName: process.env.CHROMA_COLLECTION_NAME,
    }
  }
}
