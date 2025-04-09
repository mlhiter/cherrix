import path from 'path'

export const CHROMA_CONFIG = {
  collectionName: 'cherrix_docs',
  persistDirectory: 'http://localhost:8000', // ChromaDB server URL
  clientSettings: {
    allowReset: true,
    shouldUseDBConfig: false,
  },
} as const

export const EMBEDDING_CONFIG = {
  modelName: 'text-embedding-ada-002',
  openAIApiKey: process.env.OPENAI_API_KEY,
  openAIBaseURL: process.env.OPENAI_API_URL,
  maxConcurrency: 5,
  timeout: 30000,
  stripNewLines: true,
} as const
