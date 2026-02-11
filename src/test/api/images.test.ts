import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/images/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('Images API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all images with categories', async () => {
      const mockImages = [
        {
          id: '1',
          title: 'Test Image',
          alt: 'Test',
          originalUrl: 'https://images.unsplash.com/photo-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1-thumb',
          width: 1920,
          height: 1080,
          size: 1024000,
          mimeType: 'image/jpeg',
          order: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          categories: [
            {
              id: 'ci1',
              imageId: '1',
              categoryId: 'ckz8h5h5r0000000000000001',
              isCarousel: true,
              carouselOrder: 1,
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              category: {
                id: 'ckz8h5h5r0000000000000001',
                name: 'Wedding',
                slug: 'wedding',
                description: 'Wedding photos',
                coverImage: null,
                order: 0,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          ]
        }
      ]

      vi.mocked(prisma.image.findMany).mockResolvedValue(mockImages as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Test Image')
      expect(data[0].categories).toHaveLength(1)
      expect(data[0].categories[0].category.name).toBe('Wedding')
      expect(prisma.image.findMany).toHaveBeenCalledWith({
        include: {
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should return empty array when no images exist', async () => {
      vi.mocked(prisma.image.findMany).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors', async () => {
      vi.mocked(prisma.image.findMany).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch images')
    })
  })

  describe('POST', () => {
    it('should create a new image when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newImage = {
        title: 'New Image',
        alt: 'New image alt text',
        originalUrl: 'https://images.unsplash.com/photo-new',
        thumbnailUrl: 'https://images.unsplash.com/photo-new-thumb',
        width: 1920,
        height: 1080,
        size: 1024000,
        mimeType: 'image/jpeg',
        categories: [
          {
            categoryId: 'ckz8h5h5r0000000000000001',
            isCarousel: true,
            carouselOrder: 1,
            order: 0
          }
        ],
        isVisible: true
      }

      vi.mocked(prisma.categoryImage.findFirst).mockResolvedValue({ order: 5 } as any)
      vi.mocked(prisma.image.create).mockResolvedValue({
        id: '1',
        ...newImage,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: [
          {
            id: 'ci1',
            imageId: '1',
            categoryId: 'ckz8h5h5r0000000000000001',
            isCarousel: true,
            carouselOrder: 1,
            order: 6,
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
              id: 'ckz8h5h5r0000000000000001',
              name: 'Wedding',
              slug: 'wedding',
              description: null,
              coverImage: null,
              order: 0,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        ]
      } as any)

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify(newImage)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('New Image')
      expect(prisma.image.create).toHaveBeenCalled()
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Image',
          alt: 'Alt text',
          originalUrl: 'https://images.unsplash.com/photo-new',
          mimeType: 'image/jpeg',
          categories: [{ categoryId: 'ckz8h5h5r0000000000000001', isCarousel: false, order: 0 }],
          isVisible: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify({
          alt: '',
          originalUrl: 'not-a-valid-url',
          mimeType: 'application/pdf',
          categories: [],
          isVisible: true
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should auto-assign order when order is 0', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newImage = {
        title: 'Auto Order Image',
        alt: 'Alt text',
        originalUrl: 'https://images.unsplash.com/photo-auto',
        mimeType: 'image/jpeg',
        categories: [
          {
            categoryId: 'ckz8h5h5r0000000000000001',
            isCarousel: false,
            carouselOrder: null,
            order: 0
          }
        ],
        isVisible: true
      }

      vi.mocked(prisma.categoryImage.findFirst).mockResolvedValue({ order: 10 } as any)
      vi.mocked(prisma.image.create).mockResolvedValue({
        id: '1',
        ...newImage,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: []
      } as any)

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify(newImage)
      })

      await POST(request)

      expect(prisma.categoryImage.findFirst).toHaveBeenCalledWith({
        where: { categoryId: 'ckz8h5h5r0000000000000001' },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
    })

    it('should require at least one category', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const request = new Request('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify({
          title: 'No Category Image',
          alt: 'Alt text',
          originalUrl: 'https://images.unsplash.com/photo-no-cat',
          mimeType: 'image/jpeg',
          categories: [],
          isVisible: true
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})
