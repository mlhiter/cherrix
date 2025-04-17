import { ChatRole } from '@prisma/client'
export interface ChatMessage {
  id: string
  content: string
  role: ChatRole
  createdAt: Date
}
