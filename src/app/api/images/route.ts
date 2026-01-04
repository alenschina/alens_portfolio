import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ZodError } from 'zod'
import { createImageSchema, validateRequest } from '@/lib/validation'

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

    const { data: validatedData, error } = await validateRequest(request, createImageSchema)
    if (error) {
      return error
    }

    // Extract categories data and remove it from the main image data
    const { categories, ...imageData } = validatedData

    // Auto-assign order if not provided or if it's 0
    const processedCategories = categories?.map(cat => {
      // If order is 0 or not provided, auto-assign the next order
      const order = cat.order || 0
      return {
        categoryId: cat.categoryId,
        isCarousel: cat.isCarousel,
        carouselOrder: cat.carouselOrder,
        order
      }
    })

    // For each category, if order is 0 or was auto-assigned, get the max order and add 1
    const categoriesWithAutoOrder = await Promise.all(processedCategories?.map(async (cat) => {
      if (cat.order === 0) {
        const maxOrder = await prisma.categoryImage.findFirst({
          where: { categoryId: cat.categoryId },
          orderBy: { order: 'desc' },
          select: { order: true }
        })
        return {
          ...cat,
          order: (maxOrder?.order ?? -1) + 1
        }
      }
      return cat
    }) || [])

    const image = await prisma.image.create({
      data: {
        ...imageData,
        categories: categoriesWithAutoOrder.length > 0 ? {
          create: categoriesWithAutoOrder.map(cat => ({
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
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 })
  }
}
