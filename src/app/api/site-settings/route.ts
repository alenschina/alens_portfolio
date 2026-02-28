import { NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSetting, SiteSettings } from '@/lib/site-settings'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/site-settings - Get site settings
export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/site-settings - Update site settings (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body as { key: string; value: string }

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing key or value' },
        { status: 400 }
      )
    }

    // Only allow specific keys
    const allowedKeys: (keyof SiteSettings)[] = ['siteName', 'siteDescription', 'beianIcpNumber', 'beianGongAnNumber']
    if (!allowedKeys.includes(key as keyof SiteSettings)) {
      return NextResponse.json(
        { error: 'Invalid key' },
        { status: 400 }
      )
    }

    await updateSiteSetting(key as keyof SiteSettings, value)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
