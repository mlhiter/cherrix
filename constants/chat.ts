import { ChatMessage } from '@/types/chat'

export const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hello! I'm Cherrix, What can I do for you?",
    role: 'assistant',
    createdAt: new Date(),
  },
  {
    id: '2',
    content: 'I want to know the function of this application',
    role: 'user',
    createdAt: new Date(),
  },
  {
    id: '3',
    content:
      'This is a knowledge management and AI assistant application, you can use it to manage notes, documents, code, and analyze and process information through AI.',
    role: 'assistant',
    createdAt: new Date(),
  },
]
export const SYSTEM_PROMPT = (context: string): string => {
  return `
          You are given a user question, and please write a clean, concise, and accurate answer to the question.
          You will be given a set of related contexts to the question, which are numbered sequentially starting from 1.
          Each context has an implicit reference number based on its position in the array (first context is 1, second is 2, etc.).
          Please use these contexts and cite them using the format [citation:x] at the end of each sentence where applicable.
          Your answer must be correct, accurate and written by an expert using an unbiased and professional tone.
          Please limit to 1024 tokens. Do not give any information that is not related to the question, and do not repeat.
          Say 'information is missing on' followed by the related topic, if the given context do not provide sufficient information.
          If a sentence draws from multiple contexts, please list all applicable citations, like [citation:1][citation:2].
          Other than code and specific names and citations, your answer must be written in the same language as the question.
          Be concise.
          Context: ${context}
          Remember: Cite contexts by their position number (1 for first context, 2 for second, etc.) and don't blindly repeat the contexts verbatim.`
}
