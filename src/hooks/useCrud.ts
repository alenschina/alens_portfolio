"use client"

import { useState, useEffect, useCallback } from 'react'
import type { UseCrudOptions, UseCrudReturn } from '@/types'

/**
 * Generic CRUD Hook for managing API operations
 * Provides common state management and operations for all CRUD entities
 */
export function useCrud<T extends { id: string }>(
  options: UseCrudOptions<T>,
  admin = false
): UseCrudReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiEndpoint = admin ? `${options.apiEndpoint}?admin=true` : options.apiEndpoint

  /**
   * Fetch all items from the API
   */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(apiEndpoint, {
        cache: 'no-store'
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`)
      }

      const data = await res.json()
      setItems(options.transform ? data.map(options.transform) : data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error fetching items:', err)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, options.transform])

  /**
   * Create a new item
   */
  const createItem = useCallback(async (itemData: Partial<T>) => {
    try {
      setError(null)

      const res = await fetch(options.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create: ${res.statusText}`)
      }

      await fetchItems() // Refresh the list
      return await res.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create item'
      setError(errorMessage)
      throw err
    }
  }, [options.apiEndpoint, fetchItems])

  /**
   * Update an existing item
   */
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      setError(null)

      const res = await fetch(`${options.apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update: ${res.statusText}`)
      }

      await fetchItems() // Refresh the list
      return await res.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item'
      setError(errorMessage)
      throw err
    }
  }, [options.apiEndpoint, fetchItems])

  /**
   * Delete an item
   */
  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null)

      const res = await fetch(`${options.apiEndpoint}/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete: ${res.statusText}`)
      }

      await fetchItems() // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
      setError(errorMessage)
      throw err
    }
  }, [options.apiEndpoint, fetchItems])

  /**
   * Get a single item by ID
   */
  const getItem = useCallback(async (id: string) => {
    try {
      setError(null)

      const res = await fetch(`${options.apiEndpoint}/${id}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch item: ${res.statusText}`)
      }

      return await res.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch item'
      setError(errorMessage)
      throw err
    }
  }, [options.apiEndpoint])

  // Fetch items on mount
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItem
  }
}
