// =============================================================================
// Core Type Definitions for Alens Photography Portfolio
// =============================================================================

// Navigation Types
export enum NavigationType {
  LINK = 'LINK',
  CATEGORY = 'CATEGORY',
  PARENT = 'PARENT',
  EXTERNAL = 'EXTERNAL'
}

export interface NavigationItem {
  id: string
  title: string
  slug: string
  type: NavigationType
  order: number
  isVisible: boolean
  parentId?: string | null
  categoryId?: string | null
  externalUrl?: string | null
  children?: NavigationItem[]
  category?: Category
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  coverImage?: string
  order: number
  isActive: boolean
  images?: Image[]
  navigation?: NavigationItem[]
}

// Category-Image Association (Junction Table)
export interface CategoryImage {
  id: string
  imageId: string
  categoryId: string
  isCarousel: boolean
  carouselOrder?: number | null
  order: number
  createdAt: Date
  updatedAt: Date
  image: Image
  category: Category
}

// Image Types
export interface Image {
  id: string
  title?: string
  alt: string
  description?: string
  originalUrl: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
  mimeType?: string
  categories: CategoryImage[]
  order: number
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiListResponse<T> {
  data: T[]
  pagination?: PaginationInfo
}

export interface ApiSingleResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Form Types
export interface CreateNavigationData {
  title: string
  slug: string
  type: NavigationType
  parentId?: string | null
  categoryId?: string | null
  externalUrl?: string | null
  order: number
  isVisible: boolean
}

export interface UpdateNavigationData extends Partial<CreateNavigationData> {
  id?: string
}

export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  coverImage?: string
  order: number
  isActive: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id?: string
}

export interface CreateImageData {
  title?: string
  alt: string
  description?: string
  originalUrl: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
  mimeType?: string
  categories: {
    categoryId: string
    isCarousel?: boolean
    carouselOrder?: number | null
    order: number
  }[]
  isVisible: boolean
}

export interface UpdateImageData extends Partial<Omit<CreateImageData, 'originalUrl'>> {
  id?: string
}

// Component Props Types
export interface ImageCarouselProps {
  images: Image[]
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
  onGoToSlide: (index: number) => void
  autoPlay?: boolean
  interval?: number
}

export interface NavigationMenuProps {
  items: NavigationItem[]
  selectedCategory?: string
  onSelectCategory: (slug: string) => void
  expandedCategories: Record<string, boolean>
  onToggleCategory: (slug: string) => void
}

export interface ImageGalleryProps {
  images: Image[]
  currentIndex: number
  onGoToSlide: (index: number) => void
}

// Admin Table Types
export interface ColumnConfig<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface AdminTableProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  title: string
}

// Admin Form Field Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  validation?: any
}

// CRUD Hook Types
export interface UseCrudOptions<T> {
  apiEndpoint: string
  transform?: (data: any) => T
}

export interface UseCrudReturn<T> {
  items: T[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  createItem: (data: Partial<T>) => Promise<void>
  updateItem: (id: string, data: Partial<T>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  getItem: (id: string) => Promise<T>
}

// Statistics Types
export interface DashboardStats {
  totalImages: number
  totalCategories: number
  totalNavigationItems: number
  visibleImages: number
  carouselImages: number
}

// File Upload Types
export interface UploadedFileData {
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  size?: number
  mimeType?: string
  alt?: string
}

// Cache Types
export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  key: string
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Re-export commonly used types from other modules
export type { Session, User as NextAuthUser } from 'next-auth'
