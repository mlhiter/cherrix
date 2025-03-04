export interface ChatMessage {
  id: string
  content: string
  role: 'assistant' | 'user'
  timestamp: string
}
