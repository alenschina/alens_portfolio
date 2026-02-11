import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFileUpload } from '@/hooks/useFileUpload'

describe('useFileUpload', () => {
  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset XMLHttpRequest mock
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(),
      upload: {
        addEventListener: vi.fn()
      },
      addEventListener: vi.fn((event, handler) => {
        if (event === 'load') {
          // Store the handler to call it later
          setTimeout(() => {
            handler()
          }, 0)
        }
      }),
      status: 200,
      statusText: 'OK',
      responseText: JSON.stringify({
        url: 'https://example.com/uploaded.jpg',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        width: 1920,
        height: 1080
      }),
      timeout: 0
    })) as any
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFileUpload())

    expect(result.current.uploading).toBe(false)
    expect(result.current.uploadProgress).toBe(0)
    expect(result.current.uploadedData).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.inputProps.type).toBe('file')
    expect(result.current.inputProps.accept).toBe('image/*')
    expect(result.current.inputProps.disabled).toBe(false)
  })

  it('should accept custom options', () => {
    const { result } = renderHook(() =>
      useFileUpload({
        accept: '.jpg,.png',
        maxSize: 1024 * 1024 // 1MB
      })
    )

    expect(result.current.inputProps.accept).toBe('.jpg,.png')
  })

  it('should validate file size', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        maxSize: 1024, // 1KB
        onError: mockOnError
      })
    )

    const file = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' })
    const event = {
      target: {
        files: [file],
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(event)
    })

    expect(result.current.error).toContain('File size must be less than')
    expect(mockOnError).toHaveBeenCalled()
  })

  it('should validate file type', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        accept: 'image/png',
        onError: mockOnError
      })
    )

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const event = {
      target: {
        files: [file],
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(event)
    })

    expect(result.current.error).toContain('File type not supported')
    expect(mockOnError).toHaveBeenCalled()
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useFileUpload())

    act(() => {
      result.current.reset()
    })

    expect(result.current.uploading).toBe(false)
    expect(result.current.uploadProgress).toBe(0)
    expect(result.current.uploadedData).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle no file selected', async () => {
    const { result } = renderHook(() => useFileUpload())

    const event = {
      target: {
        files: null,
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(event)
    })

    expect(result.current.uploading).toBe(false)
  })

  it('should accept all file types when accept is */*', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        accept: '*/*'
      })
    )

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const event = {
      target: {
        files: [file],
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    // Should not throw validation error for file type
    await act(async () => {
      await result.current.handleFileChange(event)
    })

    // Error might be from upload, but not from validation
    expect(result.current.error).not.toContain('File type not supported')
  })

  it('should validate file by extension', async () => {
    const { result } = renderHook(() =>
      useFileUpload({
        accept: '.png,.gif',
        onError: mockOnError
      })
    )

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const event = {
      target: {
        files: [file],
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(event)
    })

    expect(result.current.error).toContain('File type not supported')
  })
})
