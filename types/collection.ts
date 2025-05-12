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
  content: string
  textContent?: string
  url: string
  lastSyncTime: Date
  lastUpdated?: string
  baseUrl?: string
  tableOfContents?: Array<{
    text: string
    url: string
    level: number
  }>
  images?: Array<{
    url: string
    alt: string
  }>
}

export interface BlogItem {
  id: string
  title: string
  content: string
  url: string
  publishDate: Date
  author: string
  lastSyncTime: Date
}

export interface GithubItem {
  id: string
  title: string
  url: string
  stars: number
  forks?: number
  language?: string
  readme?: string
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
  docItems?: DocItem[]
  blogItems?: BlogItem[]
  githubItems?: GithubItem[]
}
