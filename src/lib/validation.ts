import { z } from 'zod'
import { NavigationType } from '@/types'

// ====================
// SECURITY UTILITIES
// ====================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
}

/**
 * Validate slug format (URL-friendly)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length <= 100
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate image URL (allow only safe protocols)
 */
export function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false

  try {
    const parsed = new URL(url)
    // Allow Unsplash CDN and local uploads
    const allowedHosts = [
      'images.unsplash.com',
      'localhost',
      '127.0.0.1'
    ]

    return allowedHosts.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

// ====================
// ENHANCED ZOD SCHEMAS
// ====================

// String validation with security
const secureString = (min = 1, max = 255) =>
  z.string()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`)
    .refine(
      (val) => !/[<>]/.test(val),
      'Cannot contain angle brackets'
    )

// URL validation
const secureUrl = z.string()
  .refine(isValidUrl, 'Invalid URL format')
  .refine(
    (url) => !url.includes('javascript:'),
    'Invalid protocol'
  )

// Image URL validation
const secureImageUrl = z.string()
  .refine(isValidImageUrl, 'Invalid image URL')

// Slug validation
const secureSlug = z.string()
  .refine(isValidSlug, 'Invalid slug format (use lowercase, numbers, and hyphens)')
  .transform(sanitizeString)

// Email validation
const secureEmail = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')

// ====================
// API SCHEMAS
// ====================

// Navigation schemas
export const createNavigationSchema = z.object({
  title: secureString(1, 100),
  slug: secureSlug,
  type: z.nativeEnum(NavigationType),
  parentId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  externalUrl: secureUrl.optional().nullable(),
  order: z.number().int().min(0).max(9999),
  isVisible: z.boolean()
}).refine(
  (data) => {
    // Validate type-specific requirements
    if (data.type === 'CATEGORY' && !data.categoryId) {
      return false
    }
    if (data.type === 'PARENT' && data.categoryId) {
      return false
    }
    if (data.type === 'EXTERNAL' && !data.externalUrl) {
      return false
    }
    if (data.type === 'LINK' && data.externalUrl) {
      return false
    }
    return true
  },
  {
    message: 'Invalid navigation configuration',
    path: ['type']
  }
)

export const updateNavigationSchema = createNavigationSchema.partial().extend({
  id: z.string().cuid().optional()
})

// Category schemas
export const createCategorySchema = z.object({
  name: secureString(1, 100),
  slug: secureSlug,
  description: secureString(0, 500).optional(),
  coverImage: secureImageUrl.optional(),
  order: z.number().int().min(0).max(9999),
  isActive: z.boolean()
})

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid().optional()
})

// Image schemas
export const createImageSchema = z.object({
  title: secureString(0, 100).optional(),
  alt: secureString(1, 255),
  description: secureString(0, 500).optional(),
  originalUrl: secureImageUrl,
  thumbnailUrl: secureImageUrl.optional(),
  width: z.number().int().min(1).max(10000).optional(),
  height: z.number().int().min(1).max(10000).optional(),
  size: z.number().int().min(1).max(50 * 1024 * 1024).optional(), // Max 50MB
  mimeType: z.string().regex(/^image\//, 'Invalid MIME type'),
  categories: z.array(z.object({
    categoryId: z.string().cuid(),
    isCarousel: z.boolean(),
    carouselOrder: z.number().int().min(0).max(999).optional().nullable(),
    order: z.number().int().min(0).max(999)
  })).min(1, 'At least one category is required'),
  isVisible: z.boolean()
})

export const updateImageSchema = createImageSchema.partial().omit({
  originalUrl: true, // Don't allow changing original URL
  mimeType: true     // Don't allow changing MIME type
}).extend({
  id: z.string().cuid().optional()
})

// User schemas (for authentication)
export const loginSchema = z.object({
  email: secureEmail,
  password: z.string().min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine(
      (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val),
      'Password must contain uppercase, lowercase, and numbers'
    )
})

// Upload schema
export const uploadSchema = z.object({
  file: z.any() // Will be validated in upload handler
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

// ====================
// VALIDATION HELPERS
// ====================

/**
 * Validate and sanitize request body
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: NextResponse | null }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { data: validatedData, error: null }
  } catch (error) {
    console.error('Validation error:', error)

    if (error instanceof z.ZodError) {
      return {
        data: null as any,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message
            }))
          },
          { status: 400 }
        )
      }
    }

    return {
      data: null as any,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}

// Re-export NextResponse for use in validation helpers
import { NextResponse } from 'next/server'
