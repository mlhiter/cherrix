import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    const apiKey = await db.apiKey.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: 'API Key created', data: apiKey })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
