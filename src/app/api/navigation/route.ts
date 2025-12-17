import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z, ZodError } from 'zod'

const navigationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(['LINK', 'CATEGORY', 'PARENT', 'EXTERNAL']),
  parentId: z.string().optional(),
  categoryId: z.string().optional(),
  externalUrl: z.string().optional(),
  order: z.number().int().nonnegative(),
  isVisible: z.boolean()
})

export async function GET() {
  try {
    const navigation = await prisma.navigation.findMany({
      include: {
        children: {
          include: { category: true },
          orderBy: { order: 'asc' }
        },
        category: true
      },
      where: { parentId: null },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = navigationSchema.parse(body)

    const navigation = await prisma.navigation.create({
      data: validatedData
    })

    return NextResponse.json(navigation, { status: 201 })
  } catch (error) {
    console.error('Error creating navigation:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create navigation' }, { status: 500 })
  }
}
