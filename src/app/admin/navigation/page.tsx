'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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

export default function NavigationPage() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<NavigationItem | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NavigationFormData>({
    resolver: zodResolver(navigationSchema),
    defaultValues: {
      order: 0,
      isVisible: true,
      type: 'LINK',
    }
  })

  const selectedType = watch('type')

  useEffect(() => {
    fetchNavigation()
    fetchCategories()
  }, [])

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/navigation')
      const data = await res.json()
      setNavigation(data)
    } catch (error) {
      console.error('Error fetching navigation:', error)
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

  const onSubmit = async (data: NavigationFormData) => {
    try {
      const url = editingItem
        ? `/api/navigation/${editingItem.id}`
        : '/api/navigation'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        await fetchNavigation()
        setDialogOpen(false)
        setEditingItem(null)
        reset()
      } else {
        alert('Failed to save navigation item')
      }
    } catch (error) {
      console.error('Error saving navigation:', error)
      alert('Error saving navigation item')
    }
  }

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item)
    setValue('title', item.title)
    setValue('slug', item.slug)
    setValue('type', assertNavigationType(item.type))
    setValue('order', item.order)
    setValue('isVisible', item.isVisible)
    setValue('parentId', item.parentId || null)
    setValue('categoryId', item.categoryId || null)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const res = await fetch(`/api/navigation/${deletingItem.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchNavigation()
        setDeleteDialogOpen(false)
        setDeletingItem(null)
      } else {
        alert('Failed to delete navigation item')
      }
    } catch (error) {
      console.error('Error deleting navigation:', error)
      alert('Error deleting navigation item')
    }
  }

  const handleAddNew = () => {
    setEditingItem(null)
    reset({
      order: navigation.length,
      isVisible: true,
      type: 'LINK',
    })
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Navigation Management</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Navigation Item
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          navigation.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span>{item.title} ({item.type})</span>
                    {!item.isVisible && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Order: {item.order}</span>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setDeletingItem(item)
                      setDeleteDialogOpen(true)
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {item.children && item.children.length > 0 && (
                <CardContent>
                  <div className="ml-4 space-y-2">
                    {item.children.map((child) => (
                      <div key={child.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span>{child.title} ({child.type})</span>
                            {!child.isVisible && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Order: {child.order}</span>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(child)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setDeletingItem(child)
                              setDeleteDialogOpen(true)
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Navigation Item' : 'Add Navigation Item'}
            </DialogTitle>
          </DialogHeader>
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
                {...register('isVisible')}
                className="rounded"
              />
              <Label htmlFor="isVisible">Visible</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
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
