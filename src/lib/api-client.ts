export interface NavigationItem {
  id: string
  title: string
  slug: string
  type: string
  order: number
  isVisible: boolean
  children?: NavigationItem[]
  category?: Category
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  images: Image[]
}

export interface Image {
  id: string
  alt: string
  originalUrl: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
  mimeType?: string
  categoryId: string
  isCarousel: boolean
  carouselOrder?: number | null
  order: number
  isVisible: boolean
}

// 获取导航数据
export async function fetchNavigation(): Promise<NavigationItem[]> {
  const res = await fetch('/api/navigation', {
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error('Failed to fetch navigation')
  }
  return res.json()
}

// 获取分类数据
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories', {
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error('Failed to fetch categories')
  }
  return res.json()
}

// 根据分类 slug 获取图片
export async function fetchImagesByCategory(slug: string): Promise<Image[]> {
  const res = await fetch(`/api/images/by-category?slug=${slug}`, {
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error('Failed to fetch images')
  }
  return res.json()
}
