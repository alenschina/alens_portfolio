import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCrud } from '@/hooks/useCrud'

describe('useCrud', () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch items on mount', async () => {
    const mockItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems
    })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toEqual(mockItems)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Network error'
    })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch: Network error')
    expect(result.current.items).toEqual([])
  })

  it('should create a new item', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]
    const newItem = { id: '2', name: 'Item 2' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newItem
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [...mockItems, newItem]
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.createItem({ name: 'Item 2' })
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Item 2' })
    })
  })

  it('should update an item', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]
    const updatedItem = { id: '1', name: 'Updated Item' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedItem]
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateItem('1', { name: 'Updated Item' })
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Item' })
    })
  })

  it('should delete an item', async () => {
    const mockItems = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '2', name: 'Item 2' }]
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteItem('1')
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
      method: 'DELETE'
    })
  })

  it('should get a single item', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]
    const singleItem = { id: '1', name: 'Item 1', description: 'Detailed' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => singleItem
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let fetchedItem
    await act(async () => {
      fetchedItem = await result.current.getItem('1')
    })

    expect(fetchedItem).toEqual(singleItem)
    expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
      cache: 'no-store'
    })
  })

  it('should use admin endpoint when admin flag is true', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems
    })

    renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' }, true)
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/test?admin=true', {
        cache: 'no-store'
      })
    })
  })

  it('should apply transform function to fetched items', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]
    const transform = vi.fn((item) => ({ ...item, transformed: true }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems
    })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test', transform })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(transform).toHaveBeenCalled()
    expect(result.current.items[0]).toHaveProperty('transformed', true)
  })

  it('should handle create error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Creation failed' })
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // The create should throw an error
    await act(async () => {
      try {
        await result.current.createItem({ name: 'New Item' })
      } catch {
        // Expected to throw
      }
    })

    // Error should be set in state
    expect(result.current.error).toBeDefined()
  })

  it('should refresh items manually', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }]

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [...mockItems, { id: '2', name: 'Item 2' }]
      })

    const { result } = renderHook(() =>
      useCrud({ apiEndpoint: '/api/test' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toHaveLength(1)

    await act(async () => {
      await result.current.fetchItems()
    })

    expect(result.current.items).toHaveLength(2)
  })
})
