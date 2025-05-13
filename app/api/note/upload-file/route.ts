import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { minioClient } from '@/lib/minio'

export async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (exists) {
      return true
    }
    return false
  } catch (error) {
    console.error('check bucket failed:', error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'User not authenticated' }, { status: 401 })
    }

    const bucketName = process.env.MINIO_BUCKET_NAME as string

    const bucketReady = await ensureBucketExists(bucketName)

    if (!bucketReady) {
      return NextResponse.json({ error: 'Bucket not found', details: 'Bucket not found' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    const fileBuffer = await file.arrayBuffer()
    const fileStream = Buffer.from(fileBuffer)

    const fileName = `${Date.now()}-${file.name}`

    const normalizedFolderPath = 'notes/'

    const objectKey = `${normalizedFolderPath}${fileName}`

    try {
      await minioClient.putObject(bucketName, objectKey, fileStream)

      const endPoint = process.env.MINIO_ENDPOINT as string
      const directUrl = `https://${endPoint}/${bucketName}/${objectKey}`

      return NextResponse.json({
        success: true,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: directUrl,
        path: objectKey,
      })
    } catch (uploadError) {
      console.error('upload failed:', uploadError)
      return NextResponse.json({ error: 'upload failed', details: (uploadError as Error).message }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'note file upload request failed',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
