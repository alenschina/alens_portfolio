import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  isValidSlug,
  isValidEmail,
  isValidUrl,
  isValidImageUrl,
  createCategorySchema,
  createImageSchema,
  loginSchema,
} from '@/lib/validation'

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should remove javascript protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      expect(sanitizeString('<img src=x onerror=alert(1)>')).toBe('img src=x alert(1)')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test')
    })
  })

  describe('isValidSlug', () => {
    it('should validate valid slugs', () => {
      expect(isValidSlug('my-category')).toBe(true)
      expect(isValidSlug('test-123')).toBe(true)
      expect(isValidSlug('a')).toBe(true)
    })

    it('should reject invalid slugs', () => {
      expect(isValidSlug('My Category')).toBe(false)
      expect(isValidSlug('my_category')).toBe(false)
      expect(isValidSlug('my@category')).toBe(false)
      expect(isValidSlug('')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate valid URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://www.example.com/path')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('isValidImageUrl', () => {
    it('should validate valid image URLs', () => {
      expect(isValidImageUrl('https://images.unsplash.com/photo-123')).toBe(true)
      expect(isValidImageUrl('http://localhost/uploads/image.jpg')).toBe(true)
    })

    it('should reject invalid image URLs', () => {
      expect(isValidImageUrl('https://malicious.com/image.jpg')).toBe(false)
      expect(isValidImageUrl('ftp://example.com/image.jpg')).toBe(false)
    })
  })
})

describe('Zod Schemas', () => {
  describe('createCategorySchema', () => {
    it('should validate valid category data', () => {
      const validData = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        order: 1,
        isActive: true,
      }

      expect(() => createCategorySchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid category data', () => {
      const invalidData = {
        name: '', // Too short
        slug: 'Invalid Slug!', // Contains invalid characters
        order: -1, // Negative
        isActive: 'yes', // Wrong type
      }

      expect(() => createCategorySchema.parse(invalidData)).toThrow()
    })

    it('should sanitize inputs', () => {
      const data = {
        name: 'Test Category',
        slug: 'test-category<script>', // Should be sanitized
        order: 1,
        isActive: true,
      }

      const result = createCategorySchema.parse(data)
      expect(result.slug).toBe('test-categoryscript')
      expect(result.name).toBe('Test Category')
    })
  })

  describe('createImageSchema', () => {
    it('should validate valid image data', () => {
      const validData = {
        title: 'Test Image',
        alt: 'Alt text',
        originalUrl: 'https://images.unsplash.com/photo-123',
        mimeType: 'image/jpeg',
        categories: [
          {
            categoryId: 'ckz8h5h5r0000000000000000',
            isCarousel: true,
            carouselOrder: 1,
            order: 0,
          },
        ],
        isVisible: true,
      }

      expect(() => createImageSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid image data', () => {
      const invalidData = {
        alt: '', // Required
        originalUrl: 'not-a-url', // Invalid URL
        mimeType: 'application/pdf', // Invalid MIME type
        categories: [], // Empty array
        isVisible: 'yes', // Wrong type
      }

      expect(() => createImageSchema.parse(invalidData)).toThrow()
    })

    it('should require at least one category', () => {
      const data = {
        alt: 'Alt text',
        originalUrl: 'https://images.unsplash.com/photo-123',
        mimeType: 'image/jpeg',
        categories: [],
        isVisible: true,
      }

      expect(() => createImageSchema.parse(data)).toThrow()
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      }

      expect(() => loginSchema.parse(validData)).not.toThrow()
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase
        'PASSWORD', // No lowercase
        'Password', // No numbers
        'Pass123', // Too short
      ]

      for (const password of weakPasswords) {
        expect(() => loginSchema.parse({ email: 'test@example.com', password })).toThrow()
      }
    })
  })
})
