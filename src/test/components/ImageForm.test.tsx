import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageForm } from '@/components/admin/ImageForm'

// Mock fetch
global.fetch = vi.fn()

describe('ImageForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockCategories = [
    { id: '1', name: 'Category 1', slug: 'category-1', description: '', order: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Category 2', slug: 'category-2', description: '', order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fetch as vi.MockedFunction<typeof fetch>).mockClear()
  })

  it('should render create form by default', () => {
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('Upload Image')).toBeInTheDocument()
    expect(screen.getByLabelText('Alt Text *')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Categories *')).toBeInTheDocument()
    expect(screen.getByLabelText('Visible')).toBeInTheDocument()
  })

  it('should hide file upload when editing', () => {
    const image = {
      id: '1',
      title: 'Test Image',
      alt: 'Test alt',
      description: 'Test description',
      originalUrl: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      width: 800,
      height: 600,
      size: 102400,
      mimeType: 'image/jpeg',
      categoryId: '1',
      isCarousel: false,
      carouselOrder: 0,
      order: 0,
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      categories: []
    }

    render(
      <ImageForm
        item={image}
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.queryByLabelText('Upload Image')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Test alt')).toBeInTheDocument()
  })

  it('should require alt text', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Alt text is required')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should require at least one category', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Alt Text *'), 'Test alt')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('At least one category is required')).toBeInTheDocument()
  })

  it('should toggle category selection', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const category1Checkbox = screen.getByLabelText('Category 1')
    await user.click(category1Checkbox)

    expect(category1Checkbox).toBeChecked()
  })

  it('should show carousel options when category is selected', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByLabelText('Category 1'))

    expect(screen.getByText('Carousel')).toBeInTheDocument()
  })

  it('should handle carousel toggle', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByLabelText('Category 1'))
    const carouselCheckbox = screen.getByLabelText('Carousel')
    await user.click(carouselCheckbox)

    expect(carouselCheckbox).toBeChecked()
    expect(screen.getByPlaceholderText('Carousel Order')).toBeInTheDocument()
  })

  it('should submit form with selected categories', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Alt Text *'), 'Test alt')
    await user.click(screen.getByLabelText('Category 1'))
    await user.click(screen.getByLabelText('Category 2'))
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      alt: 'Test alt',
      title: '',
      description: '',
      categories: [
        expect.objectContaining({ categoryId: '1' }),
        expect.objectContaining({ categoryId: '2' })
      ],
      isVisible: true,
      originalUrl: undefined,
      thumbnailUrl: undefined,
      width: undefined,
      height: undefined,
      size: undefined,
      mimeType: undefined
    })
  })

  it('should toggle visible checkbox', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const visibleCheckbox = screen.getByLabelText('Visible') as HTMLInputElement
    expect(visibleCheckbox.checked).toBe(true)

    await user.click(visibleCheckbox)
    expect(visibleCheckbox.checked).toBe(false)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should handle file upload', async () => {
    const user = userEvent.setup()
    ;(fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: '/uploads/test.jpg',
        thumbnailUrl: '/uploads/thumb-test.jpg',
        alt: 'Uploaded image',
        width: 800,
        height: 600,
        size: 102400,
        mimeType: 'image/jpeg'
      })
    } as Response)

    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload Image') as HTMLInputElement
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    })
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object))
    })
  })

  it('should handle upload error', async () => {
    const user = userEvent.setup()
    ;(fetch as vi.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false
    } as Response)

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload Image') as HTMLInputElement
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    })
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to upload image')
    })

    alertSpy.mockRestore()
  })

  it('should show uploading state', async () => {
    const user = userEvent.setup()
    ;(fetch as vi.MockedFunction<typeof fetch>).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep uploading state
    )

    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload Image') as HTMLInputElement
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    })
    await user.upload(fileInput, file)

    expect(screen.getByText('Uploading...')).toBeInTheDocument()
  })

  it('should disable submit button when loading', () => {
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    )

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('should populate form when editing existing image', async () => {
    const user = userEvent.setup()
    const image = {
      id: '1',
      title: 'Original Title',
      alt: 'Original alt',
      description: 'Original description',
      originalUrl: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      width: 800,
      height: 600,
      size: 102400,
      mimeType: 'image/jpeg',
      categoryId: '1',
      isCarousel: false,
      carouselOrder: 0,
      order: 0,
      isVisible: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      categories: [
        {
          id: '1',
          imageId: '1',
          categoryId: '1',
          isCarousel: true,
          carouselOrder: 1,
          order: 0,
          category: { id: '1', name: 'Category 1' }
        }
      ]
    }

    render(
      <ImageForm
        item={image}
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Original alt')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Original description')).toBeInTheDocument()
    expect((screen.getByLabelText('Visible') as HTMLInputElement).checked).toBe(false)
  })

  it('should allow removing categories', async () => {
    const user = userEvent.setup()
    render(
      <ImageForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByLabelText('Category 1'))
    expect(screen.getByLabelText('Category 1')).toBeChecked()

    await user.click(screen.getByLabelText('Category 1'))
    expect(screen.getByLabelText('Category 1')).not.toBeChecked()
  })
})
