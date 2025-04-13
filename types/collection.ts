export type SourceType = 'OFFICIAL_DOC' | 'RSS_BLOG' | 'GITHUB'

export interface CollectionSource {
  type: SourceType
  name: string
  description: string
  icon: string
}

export interface CollectionItem {
  id: string
  name: string
  sourceType: SourceType
  originalUrl: string
  lastSyncTime: string
  syncFrequency: string
  content?: string
  metadata?: Record<string, any>
}
