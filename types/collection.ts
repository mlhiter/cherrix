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
  url: string
  lastSyncTime: Date
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
  syncFrequency: string
  lastSyncTime: Date
  userId: string
  docItems?: DocItem[]
  blogItems?: BlogItem[]
  githubItems?: GithubItem[]
}
