import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    let filename = slug.join('/')

    // Security: validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    let filePath = join(uploadDir, filename)

    // Try to find the file locally
    let found = false
    try {
      await readFile(filePath)
      found = true
    } catch {
      // Try alternate paths for backwards compatibility
      const altPaths = [
        join(uploadDir, filename.replace('/uploads/', '')),
        join(uploadDir, filename.replace('/api/uploads/', '')),
        filename.startsWith('thumb-')
          ? join(uploadDir, filename)
          : join(uploadDir, `thumb-${filename.replace('/uploads/', '').replace('/api/uploads/', '')}`),
      ]
      for (const altPath of altPaths) {
        if (altPath !== filePath) {
          try {
            await readFile(altPath)
            filePath = altPath
            found = true
            break
          } catch {
            // Continue trying
          }
        }
      }
    }

    if (!found) {
      // File not found locally, check if we should redirect to COS
      const cosBaseUrl = process.env.COS_BASE_URL
      if (cosBaseUrl) {
        // Redirect to COS URL
        return NextResponse.redirect(`${cosBaseUrl}/${filename}`)
      }
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    const ext = filename.toLowerCase().split('.').pop() || ''
    const mimeType = MIME_TYPES[`.${ext}`] || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
