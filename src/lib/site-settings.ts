import { prisma } from './prisma'

export type SiteSettings = {
  siteName: string
  siteDescription: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Alens Photography',
  siteDescription: 'Professional photographer specializing in fine art and documentary photography'
}

/**
 * Get site settings from database
 * Falls back to default values if not set
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.settings.findMany()

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return {
      siteName: settingsMap.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription: settingsMap.siteDescription || DEFAULT_SETTINGS.siteDescription
    }
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Get a single site setting by key
 */
export async function getSiteSetting(key: keyof SiteSettings): Promise<string> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key }
    })
    return setting?.value || DEFAULT_SETTINGS[key] || ''
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return DEFAULT_SETTINGS[key] || ''
  }
}

/**
 * Update a single site setting
 */
export async function updateSiteSetting(
  key: keyof SiteSettings,
  value: string
): Promise<void> {
  await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
}
