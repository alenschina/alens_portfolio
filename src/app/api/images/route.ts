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

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: {
        category: true
      },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = imageSchema.parse(body)

    const image = await prisma.image.create({
      data: validatedData
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Error creating image:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}
