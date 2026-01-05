"use client"
import React from 'react'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { ColumnConfig } from '@/types'
import { useCrud } from '@/hooks/useCrud'
import { getErrorMessage } from '@/lib/error-handler'

interface CrudPageProps<T extends { id: string }> {
  title: string
  apiEndpoint: string
  columns: ColumnConfig<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  renderForm: (props: {
    item?: T
    onSubmit: (...args: any[]) => Promise<void>
    onCancel: () => void
    loading?: boolean
  }) => React.ReactElement
  transform?: (data: any) => T
  admin?: boolean
}

/**
 * Generic CRUD page component that provides common UI and operations
 * Reduces code duplication across admin management pages
 */
export function CrudPage<T extends { id: string }>({
  title,
  apiEndpoint,
  columns,
  onEdit,
  onDelete,
  renderForm,
  transform,
  admin = false
}: CrudPageProps<T>) {
  const { items, loading, error, createItem, updateItem, deleteItem } = useCrud<T>({
    apiEndpoint,
    transform
  }, admin)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<T | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAddNew = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: T) => {
    setEditingItem(item)
    if (onEdit) {
      onEdit(item)
    }
    setDialogOpen(true)
  }

  const handleDeleteClick = (item: T) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    try {
      await deleteItem(deletingItem.id)
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item')
    }
  }

  const handleFormSubmit = async (data: any, ...extraArgs: any[]) => {
    try {
      setSubmitting(true)

      if (editingItem) {
        await updateItem(editingItem.id, data)
      } else {
        await createItem(data)
      }

      setDialogOpen(false)
      setEditingItem(null)
    } catch (err) {
      console.error('Error saving item:', err)
      alert('Failed to save item')
      throw err // Re-throw to prevent dialog from closing
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setDialogOpen(false)
    setEditingItem(null)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add {title.replace(' Management', '').replace('s', '')}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Items Grid/List */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No items found. Click "Add" to create your first item.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    {columns.map((column) => (
                      <div key={String(column.key)}>
                        <span className="font-medium">
                          {column.label}:
                        </span>{' '}
                        <span className="text-gray-600">
                          {column.render
                            ? column.render(
                                (item as any)[column.key],
                                item
                              )
                            : String((item as any)[column.key] || 'N/A')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {title.replace(' Management', '')}
            </DialogTitle>
          </DialogHeader>
          {renderForm({
            item: editingItem || undefined,
            onSubmit: handleFormSubmit,
            onCancel: handleFormCancel,
            loading: submitting
          })}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this item? This action cannot be undone.
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
