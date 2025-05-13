export type SourceType = 'OFFICIAL_DOC' | 'RSS_BLOG' | 'GITHUB'

export interface CollectionSource {
  type: SourceType
  name: string
  description: string
  icon: string
}

export interface DocItem {
  id: string
  title: string
  content: string | null
  textContent?: string | null
  url: string
  lastSyncTime: Date
  lastUpdated?: string | null
  baseUrl?: string | null
  tableOfContents?: Array<{
    text: string
    url: string
    level: number
  }>
  images?: Array<{
    url: string
    alt?: string | null
  }>
}

export interface BlogItem {
  id: string
  title: string
  content: string | null
  url: string
  publishDate?: Date | null
  author?: string | null
  lastSyncTime: Date
}

export interface GithubItem {
  id: string
  name: string
  url: string
  readme?: string | null
  description?: string | null
  stars?: number | null
  forks?: number | null
  language?: string | null
  topics?: string[]
  lastSyncTime: Date
}

export interface CollectionItem {
  id: string
  name: string
  sourceType: 'OFFICIAL_DOC' | 'RSS_BLOG' | 'GITHUB'
  originalUrl: string
  syncFrequency: 'daily' | 'weekly' | 'monthly'
  lastSyncTime: Date
  userId: string
  isVectorized: boolean
  docItems?: DocItem[]
  blogItems?: BlogItem[]
  githubItems?: GithubItem[]
}
