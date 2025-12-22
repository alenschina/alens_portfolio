'use client'

import type { Image, Category, CategoryImage } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

// Admin-specific image type with nested category data from API
type AdminImage = Image & {
  categories: (CategoryImage & {
    category: { id: string; name: string }
  })[]
}

interface ImagesByCategoryProps {
  categories: Category[]
  images: AdminImage[]
  onEditImage: (image: AdminImage) => void
  onDeleteImage: (image: AdminImage) => Promise<void>
}

export function ImagesByCategory({ categories, images, onEditImage, onDeleteImage }: ImagesByCategoryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingImage, setDeletingImage] = useState<AdminImage | null>(null)

  const handleDeleteClick = (image: AdminImage) => {
    setDeletingImage(image)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingImage) return

    try {
      await onDeleteImage(deletingImage)
      setDeleteDialogOpen(false)
      setDeletingImage(null)
    } catch (err) {
      console.error('Error deleting image:', err)
      alert('Failed to delete image')
    }
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        // Filter images that belong to this category
        const categoryImages = images.filter(img =>
          img.categories.some(ci => ci.categoryId === category.id)
        )

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {category.name}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({categoryImages.length} images)
                </span>
              </h2>
            </div>

            {categoryImages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No images in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryImages.map((image) => {
                  const categoryImageData = image.categories.find(ci => ci.categoryId === category.id)
                  return (
                    <div
                      key={image.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Image Preview */}
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={image.thumbnailUrl || image.originalUrl}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = image.originalUrl
                          }}
                        />
                        {/* Carousel Badge */}
                        {categoryImageData?.isCarousel && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Carousel #{categoryImageData.carouselOrder || 0}
                          </span>
                        )}
                        {/* Visibility Badge */}
                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                          image.isVisible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {image.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      {/* Image Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {image.title || image.alt}
                        </h3>
                        {image.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 truncate">
                          Alt: {image.alt}
                        </p>
                        <p className="text-xs text-gray-400">
                          {image.mimeType} {image.width && image.height ? `• ${image.width}×${image.height}` : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditImage(image)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(image)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Delete Confirmation Dialog */}
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
