'use client'

import { useEffect, useState } from 'react'
import type { NavigationItem, Category, NavigationType } from '@/types'
import { CrudPage } from '@/components/admin/CrudPage'
import { NavigationForm } from '@/components/admin/NavigationForm'
import { getErrorMessage } from '@/lib/error-handler'

export default function NavigationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [selectedChildCategories, setSelectedChildCategories] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
    fetchNavigation()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?admin=true')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/navigation?admin=true')
      const data = await res.json()
      setNavigation(data)
    } catch (error) {
      console.error('Error fetching navigation:', error)
    }
  }

  const handleSubmit = async (data: any, childCategories?: string[]) => {
    try {
      if (data.type === 'PARENT' && childCategories && childCategories.length > 0) {
        // First create/update the parent navigation
        const parentData = {
          title: String(data.title || ''),
          slug: String(data.slug || ''),
          type: String(data.type || 'PARENT'),
          order: Number(data.order || 0),
          isVisible: Boolean(data.isVisible),
          parentId: null,
          categoryId: null,
          externalUrl: null
        }

        // Validate required fields
        if (!parentData.title || !parentData.slug) {
          throw new Error('Title and slug are required')
        }

        let parentId: string
        if (data.id) {
          // Update existing
          const res = await fetch(`/api/navigation/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parentData)
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Update error details:', errorData)
            throw new Error(errorData.error || `Failed to update navigation: ${res.status} ${res.statusText}`)
          }
          const updated = await res.json()
          parentId = updated.id

          // Delete existing children
          const children = navigation.find(n => n.id === data.id)?.children || []
          for (const child of children) {
            const deleteRes = await fetch(`/api/navigation/${child.id}`, {
              method: 'DELETE'
            })
            if (!deleteRes.ok) {
              console.error('Failed to delete child:', child.id)
            }
          }
        } else {
          // Create new
          const res = await fetch('/api/navigation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parentData)
          })
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Create error details:', errorData)
            throw new Error(errorData.error || `Failed to create navigation: ${res.status} ${res.statusText}`)
          }
          const created = await res.json()
          parentId = created.id
        }

        // Create children for selected categories
        for (let i = 0; i < childCategories.length; i++) {
          const categoryId = childCategories[i]
          const category = categories.find(c => c.id === categoryId)
          if (category) {
            const childRes = await fetch('/api/navigation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: String(category.name || ''),
                slug: String(`${data.slug}-${category.slug}`),
                type: 'CATEGORY',
                parentId: parentId,
                categoryId: categoryId,
                order: Number(i),
                isVisible: true,
                externalUrl: null
              })
            })
            if (!childRes.ok) {
              const errorData = await childRes.json().catch(() => ({ error: 'Unknown error' }))
              console.error('Failed to create child:', errorData)
            }
          }
        }

        await fetchNavigation()
      } else {
        // Normal submit for non-PARENT types
        const submitData = {
          title: String(data.title || ''),
          slug: String(data.slug || ''),
          type: String(data.type || 'LINK'),
          order: Number(data.order || 0),
          isVisible: Boolean(data.isVisible),
          parentId: data.parentId ? String(data.parentId) : null,
          categoryId: data.categoryId ? String(data.categoryId) : null,
          externalUrl: data.externalUrl ? String(data.externalUrl) : null
        }

        // Validate required fields
        if (!submitData.title || !submitData.slug) {
          throw new Error('Title and slug are required')
        }

        const url = data.id ? `/api/navigation/${data.id}` : '/api/navigation'
        const method = data.id ? 'PUT' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Submit error details:', errorData)
          throw new Error(errorData.error || `Failed to save navigation: ${res.status} ${res.statusText}`)
        }

        await fetchNavigation()
      }
    } catch (error) {
      console.error('Error saving navigation:', error)
      throw error
    }
  }

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (value: NavigationType) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'PARENT'
            ? 'bg-purple-100 text-purple-800'
            : value === 'CATEGORY'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'children',
      label: 'Children',
      render: (children?: NavigationItem[]) => (
        <span className="text-xs text-gray-600">
          {children ? `${children.length} items` : '-'}
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
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip: PARENT Navigation</h3>
        <p className="text-sm text-blue-800">
          PARENT navigation items can contain multiple CATEGORY children. When creating a PARENT item,
          you can select which categories to include as sub-menu items.
        </p>
      </div>

      <CrudPage<NavigationItem>
        title="Navigation Management"
        apiEndpoint="/api/navigation"
        columns={columns}
        onEdit={(item) => {
          console.log('Edit navigation:', item)
          if (item.type === 'PARENT' && item.children) {
            const childCategoryIds = item.children
              .filter(child => child.type === 'CATEGORY' && child.categoryId)
              .map(child => child.categoryId as string)
            setSelectedChildCategories(childCategoryIds)
          }
        }}
        onDelete={async (item) => {
          if (item.type === 'PARENT') {
            if (!confirm('This will delete the parent item and all its children. Continue?')) {
              return
            }
          }
          console.log('Delete navigation:', item)
        }}
        renderForm={({ item, onSubmit, onCancel, loading }) => {
          // Wrap the onSubmit to handle PARENT type specially
          const handleWrappedSubmit = async (data: any, childCategories?: string[]) => {
            await handleSubmit(data, childCategories)
            // Close dialog on success
            setSelectedChildCategories([])
            onCancel()
          }

          return (
            <NavigationForm
              item={item}
              categories={categories}
              existingNavigation={navigation}
              onSubmit={handleWrappedSubmit}
              onCancel={() => {
                setSelectedChildCategories([])
                onCancel()
              }}
              loading={loading}
            />
          )
        }}
      />
    </div>
  )
}
