import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const contactSchema = z.object({
  title: z.string().optional(),
  representation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
})

export async function GET() {
  try {
    const settings = await prisma.settings.findMany()

    const contactData = {
      title: settings.find(s => s.key === 'contact_title')?.value || '',
      representation: settings.find(s => s.key === 'contact_representation')?.value || '',
      address: settings.find(s => s.key === 'contact_address')?.value || '',
      city: settings.find(s => s.key === 'contact_city')?.value || '',
      phone: settings.find(s => s.key === 'contact_phone')?.value || '',
      email: settings.find(s => s.key === 'contact_email')?.value || '',
      website: settings.find(s => s.key === 'contact_website')?.value || '',
    }

    return NextResponse.json(contactData)
  } catch (error) {
    console.error('Error fetching contact data:', error)
    return NextResponse.json({ error: 'Failed to fetch contact data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = contactSchema.parse(body)

    // Upsert each setting
    const keys = [
      { key: 'contact_title', value: validatedData.title || '' },
      { key: 'contact_representation', value: validatedData.representation || '' },
      { key: 'contact_address', value: validatedData.address || '' },
      { key: 'contact_city', value: validatedData.city || '' },
      { key: 'contact_phone', value: validatedData.phone || '' },
      { key: 'contact_email', value: validatedData.email || '' },
      { key: 'contact_website', value: validatedData.website || '' },
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
    console.error('Error updating contact data:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update contact data' }, { status: 500 })
  }
}
