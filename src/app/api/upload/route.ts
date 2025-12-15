import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string

    if (!file || !categoryId) {
      return NextResponse.json({ error: 'Missing file or categoryId' }, { status: 400 })
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // 生成唯一文件名
    const id = nanoid()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${id}.${extension}`

    // 转换文件为缓冲区
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成缩略图
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    // 保存原图和缩略图
    const originalPath = join(uploadDir, filename)
    const thumbnailPath = join(uploadDir, `thumb-${filename}`)

    await writeFile(originalPath, buffer)
    await writeFile(thumbnailPath, thumbnailBuffer)

    // 获取图片元数据
    const metadata = await sharp(buffer).metadata()

    return NextResponse.json({
      originalUrl: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/thumb-${filename}`,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      mimeType: file.type,
      categoryId
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
