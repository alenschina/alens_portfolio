import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
          include: {
            image: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found', slug }, { status: 404 })
    }

    // Filter and sort images by order
    const images = category.images
      .filter(ci => ci.image.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(ci => ({
        ...ci.image,
        categoryImage: {
          isCarousel: ci.isCarousel,
          carouselOrder: ci.carouselOrder,
          order: ci.order
        }
      }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching category images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}
