"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'
import type { NavigationItem, Category, NavigationType } from '@/types'
import { assertNavigationType } from '@/types/guards'

const navigationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  type: z.enum(['LINK', 'CATEGORY', 'PARENT', 'EXTERNAL']),
  order: z.number().int().min(0),
  isVisible: z.boolean(),
  parentId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
})

type NavigationFormData = z.infer<typeof navigationSchema>

interface NavigationFormProps {
  item?: NavigationItem
  categories: Category[]
  onSubmit: (data: NavigationFormData, childCategories: string[]) => Promise<void>
  onCancel: () => void
  loading?: boolean
  existingNavigation?: NavigationItem[]
}

export function NavigationForm({
  item,
  categories,
  onSubmit,
  onCancel,
  loading,
  existingNavigation = []
}: NavigationFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NavigationFormData>({
    resolver: zodResolver(navigationSchema),
    defaultValues: item ? {
      id: item.id,
      title: item.title,
      slug: item.slug,
      type: item.type,
      order: item.order,
      isVisible: item.isVisible,
      parentId: item.parentId || null,
      categoryId: item.categoryId || null,
    } : {
      order: 0,
      isVisible: true,
      type: 'LINK',
    }
  })

  const isVisibleValue = watch('isVisible')
  const selectedType = watch('type')
  const selectedCategoryId = watch('categoryId')
  const [selectedChildCategories, setSelectedChildCategories] = useState<string[]>([])

  // Load existing children when editing
  useEffect(() => {
    if (item && item.type === 'PARENT' && item.children) {
      const childCategoryIds = item.children
        .filter(child => child.type === 'CATEGORY' && child.categoryId)
        .map(child => child.categoryId as string)
      setSelectedChildCategories(childCategoryIds)
    }
  }, [item])

  const handleChildCategoryToggle = (categoryId: string) => {
    setSelectedChildCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleFormSubmit = async (data: NavigationFormData) => {
    await onSubmit(data, selectedChildCategories)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Navigation title"
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="navigation-slug"
          />
          {errors.slug && (
            <p className="text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={selectedType}
            onValueChange={(value) => setValue('type', assertNavigationType(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LINK">Link</SelectItem>
              <SelectItem value="CATEGORY">Category</SelectItem>
              <SelectItem value="PARENT">Parent</SelectItem>
              <SelectItem value="EXTERNAL">External</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            {...register('order', { valueAsNumber: true })}
          />
          {errors.order && (
            <p className="text-sm text-red-600">{errors.order.message}</p>
          )}
        </div>
      </div>

      {selectedType === 'CATEGORY' && (
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={selectedCategoryId || ''}
            onValueChange={(value) => setValue('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>
      )}

      {selectedType === 'PARENT' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <Label className="text-lg font-semibold text-blue-900">
              Child Categories
            </Label>
          </div>
          <p className="text-sm text-blue-700">
            Select categories to display under this parent navigation item.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${cat.id}`}
                  checked={selectedChildCategories.includes(cat.id)}
                  onCheckedChange={() => handleChildCategoryToggle(cat.id)}
                />
                <Label
                  htmlFor={`category-${cat.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>

          {selectedChildCategories.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Selected Categories ({selectedChildCategories.length})
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedChildCategories.map((catId) => {
                  const cat = categories.find(c => c.id === catId)
                  return cat ? (
                    <div
                      key={catId}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleChildCategoryToggle(catId)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isVisible"
          checked={isVisibleValue}
          onChange={(e) => setValue('isVisible', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isVisible">Visible</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
