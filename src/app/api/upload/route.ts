import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { uploadToCOS, uploadThumbnail } from '@/lib/cos'

// Security constants
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/**
 * Validate file type by checking MIME type and extension
 */
function isValidFileType(file: File): boolean {
  const mimeType = file.type.toLowerCase()
  const extension = file.name.toLowerCase().split('.').pop() || ''

  return ALLOWED_MIME_TYPES.includes(mimeType) &&
         ALLOWED_EXTENSIONS.includes(`.${extension}`)
}

/**
 * Validate filename to prevent path traversal
 */
function isValidFilename(filename: string): boolean {
  // Check for null byte
  if (filename.includes('\0')) {
    return false
  }

  // Check for path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false
  }

  // Check length
  if (filename.length > 255 || filename.length < 1) {
    return false
  }

  return true
}

/**
 * Generate safe random filename
 */
function generateSafeFilename(originalName: string): string {
  const id = nanoid(16)
  const extension = originalName.toLowerCase().split('.').pop() || 'jpg'
  return `${id}.${extension}`
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    // Security checks
    if (!isValidFilename(file.name)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    if (!isValidFileType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Generate safe filename
    const filename = generateSafeFilename(file.name)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Verify image with sharp and get metadata
    let metadata: sharp.Metadata
    try {
      metadata = await sharp(buffer).metadata()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    // Compress main image (keep original resolution, reduce file size)
    let processedBuffer: Buffer = buffer
    if (['image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      processedBuffer = Buffer.from(await sharp(buffer).jpeg({ quality: 80 }).toBuffer())
    } else if (file.type === 'image/png') {
      processedBuffer = Buffer.from(await sharp(buffer).png({ compressionLevel: 9 }).toBuffer())
    }

    // Generate thumbnail
    const thumbnailBuffer = await sharp(processedBuffer)
      .resize(400, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Upload to COS
    let url: string
    let thumbnailUrl: string | undefined

    try {
      url = await uploadToCOS(processedBuffer, filename, file.type)
    } catch (err) {
      console.error('Error uploading original image:', err)
      return NextResponse.json(
        { error: 'Failed to upload original image to COS' },
        { status: 500 }
      )
    }

    try {
      thumbnailUrl = await uploadThumbnail(thumbnailBuffer, filename)
    } catch (err) {
      console.warn('Failed to upload thumbnail, continuing without it:', err)
      thumbnailUrl = undefined
    }

    return NextResponse.json({
      url,
      thumbnailUrl,
      width: metadata.width,
      height: metadata.height,
      size: processedBuffer.length,
      mimeType: file.type,
      alt: file.name.replace(/\.[^/.]+$/, '') // Generate alt from filename
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
