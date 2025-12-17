import { z } from 'zod'

// Schema for creating new images (all required fields for new records)
export const createImageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().min(1, 'Alt text is required'),
  description: z.string().optional(),
  originalUrl: z.string().url('Invalid URL format'),
  thumbnailUrl: z.string().url().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  size: z.number().int().optional(),
  mimeType: z.string().optional(),
  categories: z.array(z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    isCarousel: z.boolean().optional(),
    carouselOrder: z.number().int().min(0).optional().nullable(),
    order: z.number().int().min(0)
  })).optional(),
  isVisible: z.boolean().default(true)
})

// Schema for updating images (all fields optional for partial updates)
export const updateImageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().min(1).optional(),
  description: z.string().optional(),
  originalUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  size: z.number().int().optional(),
  mimeType: z.string().optional(),
  categories: z.array(z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    isCarousel: z.boolean().optional(),
    carouselOrder: z.number().int().min(0).optional().nullable(),
    order: z.number().int().min(0)
  })).optional(),
  isVisible: z.boolean().optional()
})

export type CreateImageData = z.infer<typeof createImageSchema>
export type UpdateImageData = z.infer<typeof updateImageSchema>

// Schema for CategoryImage association
export const createCategoryImageSchema = z.object({
  imageId: z.string().min(1),
  categoryId: z.string().min(1),
  isCarousel: z.boolean().optional(),
  carouselOrder: z.number().int().min(0).optional().nullable(),
  order: z.number().int().min(0)
})

export type CreateCategoryImageData = z.infer<typeof createCategoryImageSchema>
