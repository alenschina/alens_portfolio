import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const imageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().min(1),
  description: z.string().optional(),
  originalUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  size: z.number().int().optional(),
  mimeType: z.string().optional(),
  categoryId: z.string().min(1),
  isCarousel: z.boolean().optional(),
  carouselOrder: z.number().int().optional().nullable(),
  order: z.number().int().nonnegative(),
  isVisible: z.boolean()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: params.id },
      include: { category: true }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = imageSchema.parse(body)

    const image = await prisma.image.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error updating image:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.image.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
