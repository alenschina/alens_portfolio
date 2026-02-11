import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/categories/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all categories for public request', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Test Category',
          slug: 'test-category',
          isActive: true,
          order: 0,
          images: [
            {
              image: {
                id: 'img1',
                title: 'Test Image',
                alt: 'Test',
                originalUrl: 'https://example.com/image.jpg',
                thumbnailUrl: null,
                width: null,
                height: null,
                size: null,
                mimeType: 'image/jpeg',
                order: 0,
                isVisible: true,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              isCarousel: true,
              carouselOrder: 1,
              order: 0
            }
          ],
          navigation: []
        }
      ]

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Test Category')
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          images: {
            orderBy: { order: 'asc' },
            include: { image: true }
          },
          navigation: true
        },
        orderBy: { order: 'asc' }
      })
    })

    it('should return all categories including inactive for admin request', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Active Category',
          slug: 'active-category',
          isActive: true,
          order: 0,
          images: [],
          navigation: []
        },
        {
          id: '2',
          name: 'Inactive Category',
          slug: 'inactive-category',
          isActive: false,
          order: 1,
          images: [],
          navigation: []
        }
      ]

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

      const request = new Request('http://localhost:3000/api/categories?admin=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          images: {
            orderBy: { order: 'asc' },
            include: { image: true }
          },
          navigation: true
        },
        orderBy: { order: 'asc' }
      })
    })

    it('should filter out invisible images for public request', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Test Category',
          slug: 'test-category',
          isActive: true,
          order: 0,
          images: [
            {
              image: {
                id: 'img1',
                title: 'Visible Image',
                alt: 'Visible',
                originalUrl: 'https://example.com/visible.jpg',
                isVisible: true,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              isCarousel: false,
              carouselOrder: null,
              order: 0
            },
            {
              image: {
                id: 'img2',
                title: 'Invisible Image',
                alt: 'Invisible',
                originalUrl: 'https://example.com/invisible.jpg',
                isVisible: false,
                createdAt: new Date(),
                updatedAt: new Date()
              },
              isCarousel: false,
              carouselOrder: null,
              order: 1
            }
          ],
          navigation: []
        }
      ]

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any)

      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0].images).toHaveLength(1)
      expect(data[0].images[0].title).toBe('Visible Image')
    })

    it('should handle database errors', async () => {
      vi.mocked(prisma.category.findMany).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/categories')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch categories')
    })
  })

  describe('POST', () => {
    it('should create a new category when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newCategory = {
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
        order: 0,
        isActive: true
      }

      vi.mocked(prisma.category.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: '1',
        ...newCategory,
        coverImage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('New Category')
      expect(prisma.category.create).toHaveBeenCalled()
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Category',
          slug: 'new-category',
          order: 0,
          isActive: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 409 when slug already exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'existing',
        name: 'Existing Category',
        slug: 'existing-category'
      } as any)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Category',
          slug: 'existing-category',
          order: 0,
          isActive: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Category with this slug already exists')
    })

    it('should return 400 for invalid data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const request = new Request('http://localhost:3000/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          slug: 'invalid slug!',
          order: -1,
          isActive: 'yes'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})
