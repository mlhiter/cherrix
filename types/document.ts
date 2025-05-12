export interface MyDocument {
  id: string
  name: string
  path: string
  url: string | null
  type: string
  importTime: Date
  size: number
  userId: string
  isPublic: boolean
  isDeleted: boolean
  isArchived: boolean
  isFavorite: boolean
  isPinned: boolean
  isVectorized: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
