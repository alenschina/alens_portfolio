import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z, ZodError } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().int().nonnegative(),
  isActive: z.boolean()
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        images: {
          orderBy: { order: 'asc' },
          include: {
            image: true
          }
        },
        navigation: true
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Filter images where the image itself is visible
    const transformedCategory = {
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
    }

    return NextResponse.json(transformedCategory)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { categoryId } = await params
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: validatedData
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { categoryId } = await params

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
