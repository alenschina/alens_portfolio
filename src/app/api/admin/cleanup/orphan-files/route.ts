import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listCOSFiles, deleteFromCOS } from '@/lib/cos'

/**
 * GET /api/admin/cleanup/orphan-files
 * 列出 COS 上的孤立文件（存在于 COS 但不在数据库中）
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 获取 COS 所有文件
    const cosFiles = await listCOSFiles()

    // 2. 获取数据库中引用的所有文件名
    const images = await prisma.image.findMany({
      select: { originalUrl: true, thumbnailUrl: true }
    })

    const referencedFiles = new Set<string>()
    for (const img of images) {
      const filename = img.originalUrl.split('/').pop()!
      referencedFiles.add(filename)
      if (img.thumbnailUrl) {
        referencedFiles.add(img.thumbnailUrl.split('/').pop()!)
      }
    }

    // 3. 找出孤立文件
    const orphanFiles = cosFiles.filter(f => !referencedFiles.has(f))

    return NextResponse.json({ files: orphanFiles })
  } catch (error) {
    console.error('Error listing orphan files:', error)
    return NextResponse.json({ error: 'Failed to list orphan files' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/cleanup/orphan-files
 * 批量删除孤立文件
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filenames } = await request.json()

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json({ error: 'No filenames provided' }, { status: 400 })
    }

    let deleted = 0
    let failed = 0

    for (const filename of filenames) {
      try {
        await deleteFromCOS(filename)
        deleted++
      } catch (err) {
        console.warn(`Failed to delete ${filename}:`, err)
        failed++
      }
    }

    return NextResponse.json({ deleted, failed })
  } catch (error) {
    console.error('Error deleting orphan files:', error)
    return NextResponse.json({ error: 'Failed to delete orphan files' }, { status: 500 })
  }
}
