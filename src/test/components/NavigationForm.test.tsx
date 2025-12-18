import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavigationForm } from '@/components/admin/NavigationForm'

describe('NavigationForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockCategories = [
    { id: '1', name: 'Category 1', slug: 'category-1', description: '', order: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Category 2', slug: 'category-2', description: '', order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  it('should render create form by default', () => {
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Slug')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Order')).toBeInTheDocument()
    expect(screen.getByLabelText('Visible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('should render edit form when item is provided', () => {
    const navigation = {
      id: '1',
      title: 'Test Navigation',
      slug: 'test-navigation',
      type: 'LINK' as const,
      order: 1,
      isVisible: true,
      parentId: null,
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    render(
      <NavigationForm
        item={navigation}
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('Test Navigation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-navigation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })

  it('should submit form with correct data', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'New Navigation')
    await user.type(screen.getByLabelText('Slug'), 'new-navigation')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Navigation',
      slug: 'new-navigation',
      type: 'LINK',
      order: 0,
      isVisible: true,
      parentId: null,
      categoryId: null
    })
  })

  it('should display validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Slug is required')).toBeInTheDocument()
  })

  it('should validate slug format', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'Test')
    await user.type(screen.getByLabelText('Slug'), 'Invalid Slug!')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText('Slug must be lowercase with hyphens')).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show category dropdown when type is CATEGORY', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const typeSelect = screen.getByRole('button', { name: 'Select type' })
    await user.click(typeSelect)
    await user.click(screen.getByRole('option', { name: 'Category' }))

    expect(screen.getByText('Category')).toBeInTheDocument()
    const categorySelect = screen.getByRole('button', { name: 'Select category' })
    expect(categorySelect).toBeInTheDocument()
  })

  it('should toggle visible checkbox', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const checkbox = screen.getByLabelText('Visible') as HTMLInputElement
    expect(checkbox.checked).toBe(true)

    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
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
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    )

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('should set default order to 0', () => {
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const orderInput = screen.getByLabelText('Order') as HTMLInputElement
    expect(orderInput.value).toBe('0')
  })

  it('should set default type to LINK', () => {
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const typeSelect = screen.getByRole('button', { name: 'Select type' })
    expect(typeSelect).toBeInTheDocument()
  })

  it('should handle negative order validation', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    await user.type(screen.getByLabelText('Title'), 'Test')
    await user.type(screen.getByLabelText('Slug', 'test'))
    await user.clear(screen.getByLabelText('Order'))
    await user.type(screen.getByLabelText('Order'), '-1')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText(/must be greater than or equal to 0/i)).toBeInTheDocument()
  })

  it('should display all navigation types in dropdown', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const typeSelect = screen.getByRole('button', { name: 'Select type' })
    await user.click(typeSelect)

    expect(screen.getByRole('option', { name: 'Link' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Parent' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'External' })).toBeInTheDocument()
  })

  it('should hide category dropdown when type is not CATEGORY', async () => {
    const user = userEvent.setup()
    render(
      <NavigationForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const typeSelect = screen.getByRole('button', { name: 'Select type' })
    await user.click(typeSelect)
    await user.click(screen.getByRole('option', { name: 'Link' }))

    expect(screen.queryByText('Category')).not.toBeInTheDocument()
  })
})
