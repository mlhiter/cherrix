import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Document } from '@langchain/core/documents'
import { ChromaClient } from 'chromadb'
import { CHROMA_CONFIG, EMBEDDING_CONFIG } from './chroma-config'

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: EMBEDDING_CONFIG.openAIApiKey,
  modelName: EMBEDDING_CONFIG.modelName,
  configuration: {
    baseURL: EMBEDDING_CONFIG.openAIBaseURL,
  },
  maxConcurrency: EMBEDDING_CONFIG.maxConcurrency,
  timeout: EMBEDDING_CONFIG.timeout,
  stripNewLines: EMBEDDING_CONFIG.stripNewLines,
})

const client = new ChromaClient({
  path: CHROMA_CONFIG.persistDirectory,
  ...CHROMA_CONFIG.clientSettings,
})

export async function getVectorStore() {
  try {
    return await Chroma.fromExistingCollection(embeddings, {
      collectionName: CHROMA_CONFIG.collectionName,
      url: CHROMA_CONFIG.persistDirectory,
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    })
  } catch (error) {
    console.warn('Collection not found, creating new one...')
    return await Chroma.fromDocuments([], embeddings, {
      collectionName: CHROMA_CONFIG.collectionName,
      url: CHROMA_CONFIG.persistDirectory,
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    })
  }
}

export async function addDocumentsToVectorStore(documents: Document[]) {
  const store = await Chroma.fromDocuments(documents, embeddings, {
    collectionName: CHROMA_CONFIG.collectionName,
    url: CHROMA_CONFIG.persistDirectory,
    collectionMetadata: {
      'hnsw:space': 'cosine',
    },
  })
  return store
}

export async function similaritySearch(query: string, k: number = 4) {
  const store = await getVectorStore()
  return await store.similaritySearch(query, k)
}

export async function deleteCollection() {
  try {
    await client.deleteCollection({
      name: CHROMA_CONFIG.collectionName,
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
  }
}

export async function getCollectionStats() {
  try {
    const collection = await client.getOrCreateCollection({
      name: CHROMA_CONFIG.collectionName,
    })
    const count = await collection.count()

    return {
      documentCount: count,
      collectionName: CHROMA_CONFIG.collectionName,
    }
  } catch (error) {
    console.error('Error getting collection stats:', error)
    return {
      documentCount: 0,
      collectionName: CHROMA_CONFIG.collectionName,
    }
  }
}
