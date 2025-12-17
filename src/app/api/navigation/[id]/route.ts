import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const navigationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(['LINK', 'CATEGORY', 'PARENT', 'EXTERNAL']),
  parentId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  order: z.number().int().nonnegative(),
  isVisible: z.boolean()
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const navigation = await prisma.navigation.findUnique({
      where: { id },
      include: {
        children: {
          include: { category: true },
          orderBy: { order: 'asc' }
        },
        category: true,
        parent: true
      }
    })

    if (!navigation) {
      return NextResponse.json({ error: 'Navigation not found' }, { status: 404 })
    }

    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
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
    const validatedData = navigationSchema.parse(body)

    const navigation = await prisma.navigation.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error updating navigation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
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

    await prisma.navigation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting navigation:', error)
    return NextResponse.json({ error: 'Failed to delete navigation' }, { status: 500 })
  }
}
