import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const filename = slug.join('/')

    // Security: validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const cosBaseUrl = process.env.COS_BASE_URL

    if (!cosBaseUrl) {
      return NextResponse.json({ error: 'COS not configured' }, { status: 500 })
    }

    // Redirect to COS URL
    return NextResponse.redirect(`${cosBaseUrl}/${filename}`)
  } catch (error) {
    console.error('Error redirecting to upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
