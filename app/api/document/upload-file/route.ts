import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
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
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const bucketName = process.env.MINIO_BUCKET_NAME as string

    const bucketReady = await ensureBucketExists(bucketName)

    if (!bucketReady) {
      return NextResponse.json(
        { error: 'Bucket not found', details: 'Bucket not found' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    const fileBuffer = await file.arrayBuffer()
    const fileStream = Buffer.from(fileBuffer)

    const fileName = `${Date.now()}-${file.name}`

    const normalizedFolderPath = 'documents/'

    const objectKey = `${normalizedFolderPath}${fileName}`

    try {
      const result = await minioClient.putObject(
        bucketName,
        objectKey,
        fileStream
      )

      const endPoint = process.env.MINIO_ENDPOINT as string
      const fileUrl = `https://${endPoint}/${bucketName}/${objectKey}`

      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const fileType = fileExtension

      const document = await db.document.create({
        data: {
          name: file.name,
          type: fileType,
          size: file.size,
          path: objectKey,
          url: fileUrl,
          userId: userId,
          tags: [],
          isPublic: false,
          isDeleted: false,
          isArchived: false,
          isFavorite: false,
          isPinned: false,
        },
      })

      return NextResponse.json({
        success: true,
        document: document,
        etag: result.etag,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        path: objectKey,
      })
    } catch (uploadError) {
      return NextResponse.json(
        { error: 'upload failed', details: (uploadError as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'file upload request failed',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
