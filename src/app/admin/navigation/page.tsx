'use client'

import { useEffect, useState } from 'react'
import type { NavigationItem, Category, NavigationType } from '@/types'
import { CrudPage } from '@/components/admin/CrudPage'
import { NavigationForm } from '@/components/admin/NavigationForm'

export default function NavigationPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (value: NavigationType) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
          {value}
        </span>
      )
    },
    { key: 'order', label: 'Order' },
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

  return (
    <CrudPage<NavigationItem>
      title="Navigation Management"
      apiEndpoint="/api/navigation"
      columns={columns}
      onEdit={(item) => console.log('Edit navigation:', item)}
      onDelete={(item) => console.log('Delete navigation:', item)}
      renderForm={({ item, onSubmit, onCancel, loading }) => (
        <NavigationForm
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
