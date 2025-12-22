'use client'

import type { Image, Category, CategoryImage } from '@/types'
import { ImagesByCategory } from '@/components/admin/ImagesByCategory'
import { ImageForm } from '@/components/admin/ImageForm'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Admin-specific image type with nested category data from API
type AdminImage = Image & {
  categories: (CategoryImage & {
    category: { id: string; name: string }
  })[]
}

export default function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<AdminImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<AdminImage | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData)

      // Fetch images
      const imagesRes = await fetch('/api/images')
      if (!imagesRes.ok) throw new Error('Failed to fetch images')
      const imagesData = await imagesRes.json()
      setImages(imagesData)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddNew = () => {
    setEditingImage(null)
    setFormDialogOpen(true)
  }

  const handleEditImage = (image: AdminImage) => {
    setEditingImage(image)
    setFormDialogOpen(true)
  }

  const handleDeleteImage = async (image: AdminImage) => {
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete image')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error deleting image:', err)
      throw err
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setSubmitting(true)

      const url = editingImage ? `/api/images/${editingImage.id}` : '/api/images'
      const method = editingImage ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        throw new Error(editingImage ? 'Failed to update image' : 'Failed to create image')
      }

      setFormDialogOpen(false)
      setEditingImage(null)
      await fetchData()
    } catch (err) {
      console.error('Error saving image:', err)
      alert('Failed to save image')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setFormDialogOpen(false)
    setEditingImage(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <Button onClick={fetchData} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Images Management</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Images by Category */}
      <ImagesByCategory
        categories={categories}
        images={images}
        onEditImage={handleEditImage}
        onDeleteImage={handleDeleteImage}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? 'Edit Image' : 'Add Image'}
            </DialogTitle>
          </DialogHeader>
          <ImageForm
            item={editingImage || undefined}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
