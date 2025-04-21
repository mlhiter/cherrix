import { NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { similaritySearch } from '@/lib/vector-store'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// get all messages for a chat
export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = await params
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const messages = await db.chatMessage.findMany({
      where: {
        chatId,
        chat: {
          OR: [
            { userId: session.user.id },
            { collaborators: { some: { id: session.user.id } } },
          ],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// interact with the ai and store last message to database
export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { messages } = await req.json()

    // NOTE: last message must be a user message
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === 'user')

    await db.chatMessage.create({
      data: {
        content: lastUserMessage.content,
        role: 'user',
        chatId,
      },
    })

    let context = ''

    // TODO: The context needs to be more focused; the current context is too scattered.
    if (lastUserMessage) {
      const searchResults = await similaritySearch(lastUserMessage.content)
      context = searchResults
        .map((doc, index) => `[${index + 1}] ${doc.pageContent}`)
        .join('\n\n')
    }

    let apiKeyConfig
    if (process.env.NODE_ENV === 'development') {
      apiKeyConfig = {
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
        modelId: process.env.OPENAI_MODEL_ID,
      }
    } else {
      // Get active API key
      const apiKey = await db.apiKey.findFirst({
        where: {
          userId: session.user.id,
          isActive: true,
        },
      })
      console.log('apiKey', apiKey)

      if (!apiKey) {
        return NextResponse.json(
          { success: false, error: 'No active API key found' },
          { status: 400 }
        )
      }

      apiKeyConfig = {
        apiKey: apiKey.apiKey,
        baseUrl: apiKey.baseUrl,
        modelId: apiKey.modelId,
      }
    }

    // Get AI response
    const result = streamText({
      model: createOpenAI({
        apiKey: apiKeyConfig.apiKey,
        baseURL: apiKeyConfig.baseUrl,
      })(apiKeyConfig.modelId as string),
      system: `
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
          Remember: Cite contexts by their position number (1 for first context, 2 for second, etc.) and don't blindly repeat the contexts verbatim.`,
      messages: convertToCoreMessages(messages),
    })

    // Return streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// add a new message to database
export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = await params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { content, role } = await req.json()

  const message = await db.chatMessage.create({
    data: {
      content,
      role,
      chatId,
    },
  })

  return NextResponse.json(message)
}
