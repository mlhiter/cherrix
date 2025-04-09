import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_URL,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('claude-3-7-sonnet-20250219'),
    system: 'Response in Chinese',
    messages: convertToCoreMessages(messages),
  })

  return result.toDataStreamResponse()
}
