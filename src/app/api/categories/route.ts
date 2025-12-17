import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().int().nonnegative(),
  isActive: z.boolean()
})

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
          include: {
            image: true
          }
        },
        navigation: true
      },
      orderBy: { order: 'asc' }
    })

    // Filter images where the image itself is visible
    const transformedCategories = categories.map(category => ({
      ...category,
      images: category.images
        .filter(ci => ci.image.isVisible)
        .map(ci => ({
          ...ci.image,
          categoryImage: {
            isCarousel: ci.isCarousel,
            carouselOrder: ci.carouselOrder,
            order: ci.order
          }
        }))
    }))

    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: validatedData
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
