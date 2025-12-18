import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from '@/components/admin/CategoryForm'

describe('CategoryForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  it('should render create form by default', () => {
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Order')).toBeInTheDocument()
    expect(screen.getByLabelText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render edit form when item is provided', () => {
    const category = {
      id: '1',
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    render(
      <CategoryForm
        item={category}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('Test Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('should submit form with correct data', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Name'), 'New Category')
    await user.type(screen.getByLabelText('Slug'), 'new-category')
    await user.type(screen.getByLabelText('Order'), '5')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'New Category',
      slug: 'new-category',
      description: '',
      order: 5,
      isActive: true
    })
  })

  it('should display validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Slug is required')).toBeInTheDocument()
  })

  it('should validate slug format', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Name'), 'Test')
    await user.type(screen.getByLabelText('Slug'), 'Invalid Slug!')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Slug must be lowercase with hyphens')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should toggle active checkbox', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const checkbox = screen.getByLabelText('Active') as HTMLInputElement
    expect(checkbox.checked).toBe(true)

    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnCancel).toHaveBeenCalled()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should disable submit button when loading', () => {
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    )

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('should set default order to 0', () => {
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const orderInput = screen.getByLabelText('Order') as HTMLInputElement
    expect(orderInput.value).toBe('0')
  })

  it('should handle negative order validation', async () => {
    const user = userEvent.setup()
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Name'), 'Test')
    await user.type(screen.getByLabelText('Slug'), 'test')
    await user.clear(screen.getByLabelText('Order'))
    await user.type(screen.getByLabelText('Order'), '-1')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText(/must be greater than or equal to 0/i)).toBeInTheDocument()
  })

  it('should display description field as textarea', () => {
    render(
      <CategoryForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const descriptionField = screen.getByLabelText('Description')
    expect(descriptionField.tagName).toBe('TEXTAREA')
  })

  it('should populate form when editing existing category', async () => {
    const user = userEvent.setup()
    const category = {
      id: '1',
      name: 'Original Name',
      slug: 'original-slug',
      description: 'Original description',
      order: 10,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    render(
      <CategoryForm
        item={category}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('Original Name')).toBeInTheDocument()
    expect(screen.getByDisplayValue('original-slug')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Original description')).toBeInTheDocument()
    expect((screen.getByLabelText('Order') as HTMLInputElement).value).toBe('10')
    expect((screen.getByLabelText('Active') as HTMLInputElement).checked).toBe(false)
  })

  it('should allow editing and submitting updated data', async () => {
    const user = userEvent.setup()
    const category = {
      id: '1',
      name: 'Original Name',
      slug: 'original-slug',
      description: 'Original description',
      order: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    render(
      <CategoryForm
        item={category}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Updated Name')
    await user.click(screen.getByRole('button', { name: /update/i }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Updated Name',
      slug: 'original-slug',
      description: 'Original description',
      order: 10,
      isActive: true
    })
  })
})
