import { format } from 'date-fns'

import { ChatMessage } from '@/types/chat'

const getCurrentTime = () => {
  return format(new Date(), 'HH:mm')
}

export const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hello! I'm Cherrix, What can I do for you?",
    role: 'assistant',
    timestamp: getCurrentTime(),
  },
  {
    id: '2',
    content: 'I want to know the function of this application',
    role: 'user',
    timestamp: getCurrentTime(),
  },
  {
    id: '3',
    content:
      'This is a knowledge management and AI assistant application, you can use it to manage notes, documents, code, and analyze and process information through AI.',
    role: 'assistant',
    timestamp: getCurrentTime(),
  },
]
