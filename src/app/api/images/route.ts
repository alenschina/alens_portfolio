import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createImageSchema } from '@/schemas/image'
import { z } from 'zod'

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to include categories in a more convenient format
    const transformedImages = images.map(image => ({
      ...image,
      categories: image.categories.map(ci => ({
        ...ci,
        category: ci.category
      }))
    }))

    return NextResponse.json(transformedImages)
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
    const validatedData = createImageSchema.parse(body)

    // Extract categories data and remove it from the main image data
    const { categories, ...imageData } = validatedData

    const image = await prisma.image.create({
      data: {
        ...imageData,
        categories: categories ? {
          create: categories.map(cat => ({
            categoryId: cat.categoryId,
            isCarousel: cat.isCarousel,
            carouselOrder: cat.carouselOrder,
            order: cat.order
          }))
        } : undefined
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
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
