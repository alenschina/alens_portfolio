import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateImageSchema } from '@/schemas/image'
import { z } from 'zod'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateImageSchema.parse(body)

    // Extract categories data if present
    const { categories, ...imageData } = validatedData

    // If categories are being updated, we need to delete old ones and create new ones
    const updateData: any = { ...imageData }
    
    if (categories !== undefined) {
      // Delete all existing category associations
      await prisma.categoryImage.deleteMany({
        where: { imageId: id }
      })
      
      // Create new category associations
      if (categories.length > 0) {
        updateData.categories = {
          create: categories.map(cat => ({
            categoryId: cat.categoryId,
            isCarousel: cat.isCarousel,
            carouselOrder: cat.carouselOrder,
            order: cat.order
          }))
        }
      }
    }

    const image = await prisma.image.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error updating image:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.image.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
