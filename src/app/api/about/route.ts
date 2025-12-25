import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const aboutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().optional(),
  intro: z.string().min(1, 'Introduction is required'),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const settings = await prisma.settings.findMany()

    const aboutData = {
      name: settings.find(s => s.key === 'about_name')?.value || '',
      avatar: settings.find(s => s.key === 'about_avatar')?.value || '',
      intro: settings.find(s => s.key === 'about_intro')?.value || '',
      description: settings.find(s => s.key === 'about_description')?.value || '',
    }

    return NextResponse.json(aboutData)
  } catch (error) {
    console.error('Error fetching about data:', error)
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = aboutSchema.parse(body)

    // Upsert each setting
    const keys = [
      { key: 'about_name', value: validatedData.name },
      { key: 'about_avatar', value: validatedData.avatar || '' },
      { key: 'about_intro', value: validatedData.intro },
      { key: 'about_description', value: validatedData.description || '' },
    ]

    await Promise.all(
      keys.map(({ key, value }) =>
        prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating about data:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update about data' }, { status: 500 })
  }
}
