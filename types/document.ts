export interface Document {
  id: string
  name: string
  type: string
  createdAt?: string
  importTime?: string
  content?: string
  source?: string
  tags?: string[]
  isPublic?: boolean
  isDeleted?: boolean
  isArchived?: boolean
  isFavorite?: boolean
  isPinned?: boolean
}
