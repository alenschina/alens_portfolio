import useSWR from 'swr'
import type { NavigationItem, Category, Image, CategoryImage, AboutData, ContactData } from '@/types'

// Generic fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`)
  }
  return res.json()
}

// Cache configuration
export const CACHE_CONFIG = {
  // Static data - cache for 1 hour
  STATIC: {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 3600000, // 1 hour
    dedupingInterval: 3600000, // 1 hour
  },
  // Dynamic data - cache for 5 minutes
  DYNAMIC: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // 5 minutes
    dedupingInterval: 30000, // 30 seconds
  },
  // Real-time data - cache for 30 seconds
  REALTIME: {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
    dedupingInterval: 5000, // 5 seconds
  }
}

// Navigation API hook
export function useNavigation() {
  const { data, error, isLoading, mutate } = useSWR<NavigationItem[]>(
    '/api/navigation',
    fetcher,
    CACHE_CONFIG.STATIC
  )

  return {
    navigation: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

// Categories API hook
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    '/api/categories',
    fetcher,
    CACHE_CONFIG.STATIC
  )

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

// Images API hook
export function useImages() {
  const { data, error, isLoading, mutate } = useSWR<Image[]>(
    '/api/images',
    fetcher,
    CACHE_CONFIG.DYNAMIC
  )

  return {
    images: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

// Images by category API hook
export function useImagesByCategory(categorySlug: string | null) {
  const shouldFetch = !!categorySlug

  const { data, error, isLoading, mutate } = useSWR<Image[]>(
    shouldFetch ? `/api/images/by-category?slug=${categorySlug}` : null,
    fetcher,
    CACHE_CONFIG.DYNAMIC
  )

  return {
    images: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

// Generic data fetching hook
export function useApiData<T>(url: string | null, config: typeof CACHE_CONFIG.DYNAMIC) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    url ? fetcher : null,
    config
  )

  return {
    data: data as T,
    isLoading,
    isError: error,
    mutate
  }
}

// Dashboard stats hook - combines multiple APIs
export function useDashboardStats() {
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { images, isLoading: imagesLoading } = useImages()
  const { navigation, isLoading: navigationLoading } = useNavigation()

  const isLoading = categoriesLoading || imagesLoading || navigationLoading

  const stats = {
    totalCategories: categories?.length || 0,
    totalImages: images?.length || 0,
    totalNavigationItems: navigation?.length || 0,
    visibleImages: images?.filter((img: Image) => img.isVisible).length || 0,
    carouselImages: images?.filter((img: Image) =>
      img.categories?.some((cat: CategoryImage) => cat.isCarousel)
    ).length || 0
  }

  return {
    stats,
    isLoading,
    isError: !isLoading && (!categories || !images || !navigation)
  }
}

// About page data hook
export function useAbout() {
  const { data, error, isLoading, mutate } = useSWR<AboutData>(
    '/api/about',
    fetcher,
    CACHE_CONFIG.STATIC
  )

  return {
    about: data || { name: '', avatar: '', intro: '', description: '' },
    isLoading,
    isError: error,
    mutate
  }
}

// Contact page data hook
export function useContact() {
  const { data, error, isLoading, mutate } = useSWR<ContactData>(
    '/api/contact',
    fetcher,
    CACHE_CONFIG.STATIC
  )

  return {
    contact: data || { title: '', representation: '', address: '', city: '', phone: '', email: '', website: '' },
    isLoading,
    isError: error,
    mutate
  }
}
