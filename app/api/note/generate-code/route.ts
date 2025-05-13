import { NextResponse } from 'next/server'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { initialFiles } from '@/constants/code'
const SYSTEM_PROMPT = `You are a code generation assistant. Your task is to analyze the provided markdown content and generate appropriate code modifications for a Next.js application.


This is a example of the response:
${JSON.stringify(initialFiles)}

Rules:
1. Keep the existing Next.js project structure
2. Only modify or add files that are necessary
3. Use TypeScript for all code files
4. Maintain proper imports and dependencies
5. Ensure the code is production-ready and follows best practices

CRITICAL RESPONSE FORMAT RULES:
1. ONLY output a valid JSON string（will be parsed by JSON.parse） - no prefix, no suffix, no explanation
2. The JSON must start with { and end with } - no other characters allowed
3. For file in Folder, you should use the following format:
  // This is a directory - provide its name as a key
  src: {
    // Because it's a directory, add the "directory" key
    directory: {
      // This is a file - provide its path as a key:
      'main.js': {
        // Because it's a file, add the "file" key
        file: {
          contents: 'console.log("Hello from WebContainers!")',
        },
      },
    },
  },


IMPORTANT: ANY TEXT OUTSIDE THE JSON STRUCTURE WILL CAUSE AN ERROR. DO NOT ADD ANY EXPLANATIONS OR COMMENTS OUTSIDE THE JSON.`

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, noteId } = await req.json()

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

      if (!apiKey) {
        return NextResponse.json({ success: false, error: 'No active API key found' }, { status: 400 })
      }

      apiKeyConfig = {
        apiKey: apiKey.apiKey,
        baseUrl: apiKey.baseUrl,
        modelId: apiKey.modelId,
      }
    }

    // Get AI response
    const { text } = await generateText({
      model: createOpenAI({
        apiKey: apiKeyConfig.apiKey as string,
        baseURL: apiKeyConfig.baseUrl as string,
      })(apiKeyConfig.modelId as string),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please analyze this markdown content and generate appropriate code modifications:

${content}

Note ID: ${noteId}`,
        },
      ],
      temperature: 0.7,
    })
    console.log('text', text)

    try {
      const generatedFiles = JSON.parse(text)

      return NextResponse.json(generatedFiles)
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
    }
  } catch (error) {
    console.error('[GENERATE_CODE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
