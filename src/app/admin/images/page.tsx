'use client'

import type { Image, Category, CategoryImage } from '@/types'
import { CrudPage } from '@/components/admin/CrudPage'
import { ImageForm } from '@/components/admin/ImageForm'
import { useState, useEffect } from 'react'

// Admin-specific image type with nested category data from API
type AdminImage = Image & {
  categories: (CategoryImage & {
    category: { id: string; name: string }
  })[]
}

export default function ImagesPage() {
  const [categories, setCategories] = useState<Category[]>([])

  const columns = [
    {
      key: 'title' as keyof AdminImage,
      label: 'Title',
      render: (value: string | undefined, item: AdminImage) => (
        <span>{value || item.alt}</span>
      )
    },
    {
      key: 'alt' as keyof AdminImage,
      label: 'Alt Text'
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (categories: AdminImage['categories']) => (
        <span className="text-gray-600">
          {categories?.map(c => c.category.name).join(', ') || 'N/A'}
        </span>
      )
    },
    {
      key: 'isCarousel',
      label: 'Carousel',
      render: (_value: any, item: AdminImage) => (
        item.categories.some(c => c.isCarousel) ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            Carousel
          </span>
        ) : (
          <span className="text-gray-400 text-xs">No</span>
        )
      )
    },
    {
      key: 'isVisible',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Visible' : 'Hidden'}
        </span>
      )
    }
  ]

  // Fetch categories for the form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <CrudPage<AdminImage>
      title="Images Management"
      apiEndpoint="/api/images"
      columns={columns}
      onEdit={(item) => console.log('Edit image:', item)}
      onDelete={(item) => console.log('Delete image:', item)}
      renderForm={({ item, onSubmit, onCancel, loading }) => (
        <ImageForm
          item={item}
          categories={categories}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      )}
    />
  )
}
