import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/navigation/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('Navigation API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return visible navigation items for public request', async () => {
      const mockNavigation = [
        {
          id: '1',
          title: 'Home',
          slug: 'home',
          type: 'LINK',
          order: 0,
          isVisible: true,
          children: [],
          category: null
        },
        {
          id: '2',
          title: 'Portfolio',
          slug: 'portfolio',
          type: 'CATEGORY',
          order: 1,
          isVisible: true,
          children: [
            {
              id: '3',
              title: 'Wedding',
              slug: 'wedding',
              type: 'CATEGORY',
              order: 0,
              isVisible: true,
              category: {
                id: 'cat1',
                name: 'Wedding',
                slug: 'wedding',
                isActive: true
              }
            }
          ],
          category: {
            id: 'cat2',
            name: 'Portfolio',
            slug: 'portfolio',
            isActive: true
          }
        }
      ]

      vi.mocked(prisma.navigation.findMany).mockResolvedValue(mockNavigation as any)

      const request = new Request('http://localhost:3000/api/navigation')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0].title).toBe('Home')
      expect(prisma.navigation.findMany).toHaveBeenCalledWith({
        include: {
          children: {
            where: { isVisible: true },
            include: { category: true },
            orderBy: { order: 'asc' }
          },
          category: true
        },
        where: { parentId: null, isVisible: true },
        orderBy: { order: 'asc' }
      })
    })

    it('should return all navigation items for admin request', async () => {
      const mockNavigation = [
        {
          id: '1',
          title: 'Hidden Item',
          slug: 'hidden',
          type: 'LINK',
          order: 0,
          isVisible: false,
          children: [],
          category: null
        }
      ]

      vi.mocked(prisma.navigation.findMany).mockResolvedValue(mockNavigation as any)

      const request = new Request('http://localhost:3000/api/navigation?admin=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].isVisible).toBe(false)
    })

    it('should filter out items with inactive categories', async () => {
      const mockNavigation = [
        {
          id: '1',
          title: 'Active Category',
          slug: 'active',
          type: 'CATEGORY',
          order: 0,
          isVisible: true,
          children: [],
          category: {
            id: 'cat1',
            name: 'Active',
            slug: 'active',
            isActive: true
          }
        },
        {
          id: '2',
          title: 'Inactive Category',
          slug: 'inactive',
          type: 'CATEGORY',
          order: 1,
          isVisible: true,
          children: [],
          category: {
            id: 'cat2',
            name: 'Inactive',
            slug: 'inactive',
            isActive: false
          }
        }
      ]

      vi.mocked(prisma.navigation.findMany).mockResolvedValue(mockNavigation as any)

      const request = new Request('http://localhost:3000/api/navigation')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Active Category')
    })

    it('should handle database errors', async () => {
      vi.mocked(prisma.navigation.findMany).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/navigation')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch navigation')
    })
  })

  describe('POST', () => {
    it('should create a new navigation item when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newNavigation = {
        title: 'New Page',
        slug: 'new-page',
        type: 'LINK',
        parentId: null,
        categoryId: null,
        externalUrl: null,
        order: 0,
        isVisible: true
      }

      vi.mocked(prisma.navigation.create).mockResolvedValue({
        id: '1',
        ...newNavigation,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const request = new Request('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify(newNavigation)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('New Page')
      expect(prisma.navigation.create).toHaveBeenCalled()
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Page',
          slug: 'new-page',
          type: 'LINK',
          order: 0,
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

      const request = new Request('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify({
          title: '',
          slug: 'test',
          type: 'INVALID_TYPE',
          order: -1,
          isVisible: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid data')
    })

    it('should create navigation item with parent', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newNavigation = {
        title: 'Child Item',
        slug: 'child-item',
        type: 'LINK',
        parentId: 'parent-1',
        categoryId: null,
        externalUrl: null,
        order: 0,
        isVisible: true
      }

      vi.mocked(prisma.navigation.create).mockResolvedValue({
        id: '2',
        ...newNavigation,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const request = new Request('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify(newNavigation)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.parentId).toBe('parent-1')
    })

    it('should create external link navigation item', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' }
      } as any)

      const newNavigation = {
        title: 'External Link',
        slug: 'external',
        type: 'EXTERNAL',
        parentId: null,
        categoryId: null,
        externalUrl: 'https://example.com',
        order: 0,
        isVisible: true
      }

      vi.mocked(prisma.navigation.create).mockResolvedValue({
        id: '3',
        ...newNavigation,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const request = new Request('http://localhost:3000/api/navigation', {
        method: 'POST',
        body: JSON.stringify(newNavigation)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.type).toBe('EXTERNAL')
      expect(data.externalUrl).toBe('https://example.com')
    })
  })
})
