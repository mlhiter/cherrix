import * as Minio from 'minio'
import { NextResponse } from 'next/server'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT as string,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY as string,
  secretKey: process.env.MINIO_SECRET_KEY as string,
})

export async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (exists) {
      return true
    } else {
      console.log(`bucket '${bucketName}' not exists, try to create...`)
      try {
        await minioClient.makeBucket(
          bucketName,
          process.env.MINIO_REGION as string
        )
        return true
      } catch (createError) {
        console.error('create bucket failed:', createError)
        return false
      }
    }
  } catch (error) {
    console.error('check bucket failed:', error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const bucketName = process.env.MINIO_BUCKET_NAME as string

    const bucketReady = await ensureBucketExists(bucketName)

    const formData = await req.formData()
    const file = formData.get('file') as File

    const fileBuffer = await file.arrayBuffer()
    const fileStream = Buffer.from(fileBuffer)

    const fileName = `${Date.now()}-${file.name}`

    const objectKey = `${normalizedFolderPath}${fileName}`

    try {
      const result = await minioClient.putObject(
        bucketName,
        objectKey,
        fileStream
      )

      const protocol = 'https://'
      const fileUrl = `${protocol}${endPoint}/${bucketName}/${objectKey}`

      return NextResponse.json({
        success: true,
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
        { error: 'Folder not found', details: (uploadError as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('file upload request failed:', error)
    return NextResponse.json(
      {
        error: 'file upload request failed',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
