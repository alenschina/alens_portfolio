import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useNavigation, useCategories, useImages, useImagesByCategory, useDashboardStats, CACHE_CONFIG } from '@/hooks/useApi'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key: string | null, fetcher: Function, config: any) => {
    // Return mock data based on the key
    const mockData = getMockData(key)
    return {
      data: mockData,
      error: null,
      isLoading: false,
      mutate: vi.fn()
    }
  })
}))

function getMockData(key: string | null) {
  if (!key) return null

  if (key.includes('/api/navigation')) {
    return [
      { id: '1', title: 'Home', slug: 'home', type: 'LINK', order: 0, isVisible: true },
      { id: '2', title: 'Portfolio', slug: 'portfolio', type: 'CATEGORY', order: 1, isVisible: true }
    ]
  }

  if (key.includes('/api/categories')) {
    return [
      { id: '1', name: 'Wedding', slug: 'wedding', order: 0, isActive: true },
      { id: '2', name: 'Portrait', slug: 'portrait', order: 1, isActive: true }
    ]
  }

  if (key.includes('/api/images/by-category')) {
    return [
      { id: '1', title: 'Image 1', alt: 'Alt 1', originalUrl: 'https://example.com/1.jpg', order: 0, isVisible: true },
      { id: '2', title: 'Image 2', alt: 'Alt 2', originalUrl: 'https://example.com/2.jpg', order: 1, isVisible: true }
    ]
  }

  if (key === '/api/images') {
    return [
      { id: '1', title: 'Image 1', alt: 'Alt 1', originalUrl: 'https://example.com/1.jpg', order: 0, isVisible: true },
      { id: '2', title: 'Image 2', alt: 'Alt 2', originalUrl: 'https://example.com/2.jpg', order: 1, isVisible: false }
    ]
  }

  return null
}

describe('useApi hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CACHE_CONFIG', () => {
    it('should have STATIC config with 1 hour revalidation', () => {
      expect(CACHE_CONFIG.STATIC.revalidateOnFocus).toBe(false)
      expect(CACHE_CONFIG.STATIC.revalidateOnReconnect).toBe(false)
      expect(CACHE_CONFIG.STATIC.refreshInterval).toBe(3600000)
      expect(CACHE_CONFIG.STATIC.dedupingInterval).toBe(3600000)
    })

    it('should have DYNAMIC config with 5 minute revalidation', () => {
      expect(CACHE_CONFIG.DYNAMIC.revalidateOnFocus).toBe(true)
      expect(CACHE_CONFIG.DYNAMIC.revalidateOnReconnect).toBe(true)
      expect(CACHE_CONFIG.DYNAMIC.refreshInterval).toBe(300000)
      expect(CACHE_CONFIG.DYNAMIC.dedupingInterval).toBe(30000)
    })

    it('should have REALTIME config with 30 second revalidation', () => {
      expect(CACHE_CONFIG.REALTIME.revalidateOnFocus).toBe(true)
      expect(CACHE_CONFIG.REALTIME.revalidateOnReconnect).toBe(true)
      expect(CACHE_CONFIG.REALTIME.refreshInterval).toBe(30000)
      expect(CACHE_CONFIG.REALTIME.dedupingInterval).toBe(5000)
    })
  })

  describe('useNavigation', () => {
    it('should return navigation data for public', () => {
      const { result } = renderHook(() => useNavigation())

      expect(result.current.navigation).toHaveLength(2)
      expect(result.current.navigation[0].title).toBe('Home')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBeNull()
    })

    it('should return navigation data for admin', () => {
      const { result } = renderHook(() => useNavigation(true))

      expect(result.current.navigation).toHaveLength(2)
      expect(result.current.navigation[0].title).toBe('Home')
    })
  })

  describe('useCategories', () => {
    it('should return categories for public', () => {
      const { result } = renderHook(() => useCategories())

      expect(result.current.categories).toHaveLength(2)
      expect(result.current.categories[0].name).toBe('Wedding')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBeNull()
    })

    it('should return categories for admin', () => {
      const { result } = renderHook(() => useCategories(true))

      expect(result.current.categories).toHaveLength(2)
      expect(result.current.categories[0].name).toBe('Wedding')
    })
  })

  describe('useImages', () => {
    it('should return all images', () => {
      const { result } = renderHook(() => useImages())

      expect(result.current.images).toHaveLength(2)
      expect(result.current.images[0].title).toBe('Image 1')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBeNull()
    })
  })

  describe('useImagesByCategory', () => {
    it('should return images for a category', () => {
      const { result } = renderHook(() => useImagesByCategory('wedding'))

      expect(result.current.images).toHaveLength(2)
      expect(result.current.images[0].title).toBe('Image 1')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBeNull()
    })

    it('should not fetch when categorySlug is null', () => {
      const { result } = renderHook(() => useImagesByCategory(null))

      expect(result.current.images).toEqual([])
    })
  })

  describe('useDashboardStats', () => {
    it('should calculate dashboard statistics', () => {
      const { result } = renderHook(() => useDashboardStats())

      expect(result.current.stats).toEqual({
        totalCategories: 2,
        totalImages: 2,
        totalNavigationItems: 2,
        visibleImages: 1,
        carouselImages: 0
      })
      expect(result.current.isLoading).toBe(false)
    })
  })
})
