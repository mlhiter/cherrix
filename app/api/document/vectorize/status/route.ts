import { NextResponse } from 'next/server'
import { deleteCollection, getCollectionStats } from '@/lib/vector-store'

export async function GET() {
  try {
    const stats = await getCollectionStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get vectorization status' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await deleteCollection()
    return NextResponse.json({
      message: 'Vector collection deleted successfully',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vector collection' }, { status: 500 })
  }
}
