import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ZodError } from 'zod'
import { createCategorySchema, validateRequest } from '@/lib/validation'

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

    // Check CSRF token (basic implementation)
    const csrfToken = request.headers.get('x-csrf-token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
    }

    const { data: validatedData, error } = await validateRequest(request, createCategorySchema)
    if (error) {
      return error
    }

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: validatedData
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
