import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest, api, ApiException, uploadFile } from '@/lib/api-error-handler'

describe('api-error-handler', () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ApiException', () => {
    it('should create error with message and status', () => {
      const error = new ApiException('Test error', 404, { detail: 'Not found' })

      expect(error.message).toBe('Test error')
      expect(error.status).toBe(404)
      expect(error.data).toEqual({ detail: 'Not found' })
      expect(error.name).toBe('ApiException')
    })

    it('should create error without status', () => {
      const error = new ApiException('Simple error')

      expect(error.message).toBe('Simple error')
      expect(error.status).toBeUndefined()
    })
  })

  describe('apiRequest', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should handle 401 error', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 401,
        message: 'Unauthorized'
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required. Please log in.')
    })

    it('should handle 403 error', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 403,
        message: 'Forbidden'
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You do not have permission to perform this action.')
    })

    it('should handle 404 error', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 404,
        message: 'Not found'
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('The requested resource was not found.')
    })

    it('should handle 429 error', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 429,
        message: 'Too many requests'
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Too many requests. Please try again later.')
    })

    it('should handle 500 error', async () => {
      // Mock a successful response that returns 500 status
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Server error' })
      })

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      // The error message should contain server error info
      expect(result.error).toBeDefined()
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await apiRequest('/api/test')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('api helper methods', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: 'test' })
      })

      await api.get('/api/test')

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should make POST request with data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1 })
      })

      const data = { name: 'Test' }
      await api.post('/api/test', data)

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    })

    it('should make PUT request with data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ updated: true })
      })

      const data = { name: 'Updated' }
      await api.put('/api/test/1', data)

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    })

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ deleted: true })
      })

      await api.delete('/api/test/1')

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      let loadHandler: Function | null = null

      class MockXHR {
        open = vi.fn()
        send = vi.fn()
        upload = {
          addEventListener: vi.fn()
        }
        addEventListener = vi.fn((event: string, handler: Function) => {
          if (event === 'load') {
            loadHandler = handler
          }
        })
        status = 200
        responseText = JSON.stringify({ url: 'https://example.com/file.jpg' })
        timeout = 0
      }

      vi.stubGlobal('XMLHttpRequest', MockXHR as any)

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const promise = uploadFile('/api/upload', file)

      // Simulate successful load
      if (loadHandler) {
        loadHandler()
      }

      const result = await promise

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ url: 'https://example.com/file.jpg' })

      vi.unstubAllGlobals()
    })

    it('should handle upload error', async () => {
      let loadHandler: Function | null = null

      class MockXHR {
        open = vi.fn()
        send = vi.fn()
        upload = {
          addEventListener: vi.fn()
        }
        addEventListener = vi.fn((event: string, handler: Function) => {
          if (event === 'load') {
            loadHandler = handler
          }
        })
        status = 500
        statusText = 'Server Error'
        responseText = JSON.stringify({ error: 'Upload failed' })
        timeout = 0
      }

      vi.stubGlobal('XMLHttpRequest', MockXHR as any)

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const promise = uploadFile('/api/upload', file)

      // Simulate error response
      if (loadHandler) {
        loadHandler()
      }

      const result = await promise

      expect(result.success).toBe(false)
      expect(result.error).toBe('Upload failed')

      vi.unstubAllGlobals()
    })
  })
})
