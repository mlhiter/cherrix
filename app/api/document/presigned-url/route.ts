import { minioClient } from '@/lib/minio'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('filePath')

  if (!filePath) {
    return new Response('File path is required', { status: 400 })
  }

  try {
    const presignedUrl = await minioClient.presignedGetObject(process.env.MINIO_BUCKET_NAME!, filePath, 60 * 60)

    return new Response(JSON.stringify({ url: presignedUrl }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response('Error generating presigned URL', { status: 500 })
  }
}
