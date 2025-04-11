import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { similaritySearch } from '@/lib/vector-store'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get the last user message
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((m: any) => m.role === 'user')

  // Perform similarity search if there's a user message
  let context = ''
  if (lastUserMessage) {
    const searchResults = await similaritySearch(lastUserMessage.content)
    context = searchResults
      .map((doc, index) => `[${index + 1}] ${doc.pageContent}`)
      .join('\n\n')
  }

  const result = streamText({
    model: openai('claude-3-7-sonnet-20250219'),
    system: `
      You are given a user question, and please write clean, concise and accurate answer to the question.
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
      Remember: Cite contexts by their position number (1 for first context, 2 for second, etc.) and don't blindly repeat the contexts verbatim.`,
    messages: convertToCoreMessages(messages),
  })

  return result.toDataStreamResponse()
}
