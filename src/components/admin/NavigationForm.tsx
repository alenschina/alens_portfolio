"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { NavigationItem, Category, NavigationType } from '@/types'
import { assertNavigationType } from '@/types/guards'

const navigationSchema = z.object({
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
  onSubmit: (data: NavigationFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function NavigationForm({ item, categories, onSubmit, onCancel, loading }: NavigationFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NavigationFormData>({
    resolver: zodResolver(navigationSchema),
    defaultValues: item ? {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Select onValueChange={(value) => setValue('categoryId', value)}>
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
