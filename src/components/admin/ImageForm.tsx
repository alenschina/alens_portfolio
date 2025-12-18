'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { Category, Image, CategoryImage, UploadedFileData } from '@/types'

// Admin-specific image type with nested category data
type AdminImage = Image & {
  categories: (CategoryImage & {
    category: { id: string; name: string }
  })[]
}

const imageSchema = z.object({
  title: z.string().optional(),
  alt: z.string().min(1, 'Alt text is required'),
  description: z.string().optional(),
  categories: z.array(z.object({
    categoryId: z.string().min(1, 'Category is required'),
    isCarousel: z.boolean(),
    carouselOrder: z.number().int().min(0).optional().nullable(),
    order: z.number().int().min(0)
  })).min(1, 'At least one category is required'),
  isVisible: z.boolean(),
})

type ImageFormData = z.infer<typeof imageSchema>

interface ImageFormProps {
  item?: AdminImage
  categories: Category[]
  onSubmit: (data: ImageFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ImageForm({ item, categories, onSubmit, onCancel, loading }: ImageFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImageData, setUploadedImageData] = useState<UploadedFileData | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      isVisible: true,
      categories: []
    }
  })

  const isVisibleValue = watch('isVisible')

  const watchedCategories = watch('categories')

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setValue('title', item.title || '')
      setValue('alt', item.alt)
      setValue('description', item.description || '')
      setValue('isVisible', item.isVisible)
      setValue('categories', item.categories.map(ci => ({
        categoryId: ci.category.id,
        isCarousel: ci.isCarousel,
        carouselOrder: ci.carouselOrder || 0,
        order: ci.order
      })))
    } else {
      reset({
        isVisible: true,
        categories: []
      })
      setUploadedImageData(null)
    }
  }, [item, setValue, reset])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const imageData = await res.json()
        setValue('alt', imageData.alt || 'Uploaded image')
        setUploadedImageData(imageData)
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const currentCategories = watchedCategories || []

    if (checked) {
      if (!currentCategories.find(c => c.categoryId === categoryId)) {
        setValue('categories', [
          ...currentCategories,
          {
            categoryId,
            isCarousel: false,
            carouselOrder: 0,
            order: currentCategories.length
          }
        ])
      }
    } else {
      setValue('categories', currentCategories.filter(c => c.categoryId !== categoryId))
    }
  }

  const updateCategoryCarousel = (categoryId: string, isCarousel: boolean, carouselOrder?: number) => {
    const currentCategories = watchedCategories || []
    setValue('categories', currentCategories.map(c =>
      c.categoryId === categoryId
        ? { ...c, isCarousel, carouselOrder: isCarousel ? (carouselOrder || 0) : null }
        : c
    ))
  }

  const handleFormSubmit = async (data: ImageFormData) => {
    try {
      const payload = item
        ? data
        : {
            ...data,
            originalUrl: uploadedImageData?.url,
            thumbnailUrl: uploadedImageData?.thumbnailUrl,
            width: uploadedImageData?.width,
            height: uploadedImageData?.height,
            size: uploadedImageData?.size,
            mimeType: uploadedImageData?.mimeType
          }

      await onSubmit(payload)
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {!item && (
        <div className="space-y-2">
          <Label htmlFor="file">Upload Image</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="alt">Alt Text *</Label>
        <Input
          id="alt"
          {...register('alt')}
          placeholder="Describe the image"
        />
        {errors.alt && (
          <p className="text-sm text-red-600">{errors.alt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Image title (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Image description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Categories *</Label>
        <div className="grid grid-cols-2 gap-2 border rounded-md p-4 max-h-60 overflow-y-auto">
          {categories.map((cat) => {
            const isChecked = watchedCategories?.some(c => c.categoryId === cat.id) || false
            const categoryData = watchedCategories?.find(c => c.categoryId === cat.id)

            return (
              <div key={cat.id} className="space-y-2 p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(cat.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`cat-${cat.id}`}>{cat.name}</Label>
                </div>

                {isChecked && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`carousel-${cat.id}`}
                        checked={categoryData?.isCarousel || false}
                        onCheckedChange={(checked) =>
                          updateCategoryCarousel(cat.id, checked as boolean, categoryData?.order)
                        }
                      />
                      <Label htmlFor={`carousel-${cat.id}`}>Carousel</Label>
                    </div>
                    {categoryData?.isCarousel && (
                      <Input
                        type="number"
                        placeholder="Carousel Order"
                        value={categoryData.carouselOrder || 0}
                        onChange={(e) =>
                          updateCategoryCarousel(cat.id, true, parseInt(e.target.value))
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {errors.categories && (
          <p className="text-sm text-red-600">{errors.categories.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isVisible"
          checked={isVisibleValue}
          onCheckedChange={(checked) => setValue('isVisible', checked as boolean)}
        />
        <Label htmlFor="isVisible">Visible</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  )
}
