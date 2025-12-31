'use client'

import type { Category, Image } from '@/types'
import { CrudPage } from '@/components/admin/CrudPage'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default function CategoriesPage() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'order', label: 'Order' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'images',
      label: 'Images',
      render: (images?: Image[]) => (
        <span className="text-gray-600">
          {images?.length ?? 0} images
        </span>
      )
    }
  ]

  return (
    <CrudPage<Category>
      title="Categories Management"
      apiEndpoint="/api/categories"
      admin={true}
      columns={columns}
      onEdit={(item) => console.log('Edit category:', item)}
      onDelete={(item) => console.log('Delete category:', item)}
      renderForm={({ item, onSubmit, onCancel, loading }) => (
        <CategoryForm
          item={item}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      )}
    />
  )
}
