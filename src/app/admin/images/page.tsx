'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import type { UploadedFileData } from '@/types'

interface Image {
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
  categories: {
    id: string
    category: { id: string; name: string }
    isCarousel: boolean
    carouselOrder?: number
    order: number
  }[]
  isVisible: boolean
}

interface Category {
  id: string
  name: string
  slug: string
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

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<Image | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingImage, setDeletingImage] = useState<Image | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageData, setUploadedImageData] = useState<UploadedFileData | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      isVisible: true,
      categories: []
    }
  })

  const watchedCategories = watch('categories')

  useEffect(() => {
    fetchImages()
    fetchCategories()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images')
      const data = await res.json()
      setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const onSubmit = async (data: ImageFormData) => {
    try {
      const url = editingImage
        ? `/api/images/${editingImage.id}`
        : '/api/images'
      const method = editingImage ? 'PUT' : 'POST'

      // For new images, include the uploaded image data
      const payload = editingImage
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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchImages()
        setDialogOpen(false)
        setEditingImage(null)
        setUploadedImageData(null)
        reset()
      } else {
        alert('Failed to save image')
      }
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Error saving image')
    }
  }

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

  const handleEdit = (image: Image) => {
    setEditingImage(image)
    setValue('title', image.title || '')
    setValue('alt', image.alt)
    setValue('description', image.description || '')
    setValue('isVisible', image.isVisible)
    setValue('categories', image.categories.map(ci => ({
      categoryId: ci.category.id,
      isCarousel: ci.isCarousel,
      carouselOrder: ci.carouselOrder || 0,
      order: ci.order
    })))
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingImage) return

    try {
      const res = await fetch(`/api/images/${deletingImage.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchImages()
        setDeleteDialogOpen(false)
        setDeletingImage(null)
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image')
    }
  }

  const handleAddNew = () => {
    setEditingImage(null)
    setUploadedImageData(null)
    reset({
      isVisible: true,
      categories: []
    })
    setDialogOpen(true)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Images Management</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={image.thumbnailUrl || image.originalUrl}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="truncate">{image.title || image.alt}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingImage(image)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Categories:</strong> {image.categories.map(c => c.category.name).join(', ')}
                </p>
                {image.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Description:</strong> {image.description}
                  </p>
                )}
                <div className="flex gap-2 text-xs flex-wrap">
                  {image.categories.some(c => c.isCarousel) && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      Carousel
                    </span>
                  )}
                  {image.isVisible ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Visible
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      Hidden
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? 'Edit Image' : 'Add Image'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!editingImage && (
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
                {...register('isVisible')}
              />
              <Label htmlFor="isVisible">Visible</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingImage ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this image? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
