import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CrudPage } from '@/components/admin/CrudPage'

// Mock the useCrud hook
vi.mock('@/hooks/useCrud', () => ({
  useCrud: vi.fn()
}))

describe('CrudPage Component', () => {
  const mockUseCrud = vi.mocked(vi.fn())
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  const mockItems = [
    { id: '1', name: 'Item 1', slug: 'item-1', order: 0, isActive: true },
    { id: '2', name: 'Item 2', slug: 'item-2', order: 1, isActive: false }
  ]

  const mockColumns = [
    { key: 'name' as const, label: 'Name' },
    { key: 'slug' as const, label: 'Slug' },
    { key: 'isActive' as const, label: 'Active', render: (value: boolean) => value ? 'Yes' : 'No' }
  ]

  const MockForm = ({ item, onSubmit, onCancel }: any) => (
    <div>
      <input data-testid="form-input" defaultValue={item?.name || ''} />
      <button onClick={() => onSubmit({ name: 'Test' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCrud.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })
  })

  it('should render page title and add button', () => {
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('Test Management')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add test/i })).toBeInTheDocument()
  })

  it('should render items list', () => {
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('item-1')).toBeInTheDocument()
    expect(screen.getByText('item-2')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    mockUseCrud.mockReturnValue({
      items: [],
      loading: true,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should display empty state', () => {
    mockUseCrud.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseCrud.mockReturnValue({
      items: [],
      loading: false,
      error: 'Test error message',
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should open add dialog when add button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    await user.click(screen.getByRole('button', { name: /add test/i }))

    expect(screen.getByTestId('form-input')).toBeInTheDocument()
  })

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onEdit={mockOnEdit}
        renderForm={MockForm}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: '' })
    await user.click(editButtons[0])

    expect(screen.getByTestId('form-input')).toBeInTheDocument()
    expect(mockOnEdit).toHaveBeenCalledWith(mockItems[0])
  })

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    await user.click(screen.getByRole('button', { name: /add test/i }))
    expect(screen.getByTestId('form-input')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('form-input')).not.toBeInTheDocument()
    })
  })

  it('should open delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onDelete={mockOnDelete}
        renderForm={MockForm}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    // First button is edit, second is delete (based on order in component)
    await user.click(deleteButtons[1])

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
  })

  it('should cancel delete dialog', async () => {
    const user = userEvent.setup()
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onDelete={mockOnDelete}
        renderForm={MockForm}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    await user.click(deleteButtons[1])
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
    })
  })

  it('should confirm delete and call deleteItem', async () => {
    const user = userEvent.setup()
    const { deleteItem } = mockUseCrud.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onDelete={mockOnDelete}
        renderForm={MockForm}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    await user.click(deleteButtons[1])

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(deleteItem).toHaveBeenCalledWith(mockItems[0].id)
  })

  it('should submit form to create new item', async () => {
    const user = userEvent.setup()
    const { createItem } = mockUseCrud.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    await user.click(screen.getByRole('button', { name: /add test/i }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(createItem).toHaveBeenCalledWith({ name: 'Test' })
  })

  it('should submit form to update existing item', async () => {
    const user = userEvent.setup()
    const { updateItem } = mockUseCrud.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: '' })
    await user.click(editButtons[0])
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(updateItem).toHaveBeenCalledWith(mockItems[0].id, { name: 'Test' })
  })

  it('should handle form submission errors', async () => {
    const user = userEvent.setup()
    const { updateItem } = mockUseCrud.mockReturnValue({
      items: mockItems,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn().mockRejectedValue(new Error('Update failed')),
      deleteItem: vi.fn()
    })

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: '' })
    await user.click(editButtons[0])
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to save item')
    })

    alertSpy.mockRestore()
  })

  it('should render columns with custom render function', () => {
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('should render N/A for undefined column values', () => {
    const itemsWithUndefined = [{ id: '1', name: undefined, slug: 'item-1' }]
    mockUseCrud.mockReturnValue({
      items: itemsWithUndefined,
      loading: false,
      error: null,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn()
    })

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should handle onEdit callback', async () => {
    const user = userEvent.setup()
    const mockEditCallback = vi.fn()

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onEdit={mockEditCallback}
        renderForm={MockForm}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: '' })
    await user.click(editButtons[0])

    expect(mockEditCallback).toHaveBeenCalledWith(mockItems[0])
  })

  it('should handle onDelete callback', async () => {
    const user = userEvent.setup()
    const mockDeleteCallback = vi.fn()

    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        onDelete={mockDeleteCallback}
        renderForm={MockForm}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    await user.click(deleteButtons[1])

    expect(mockDeleteCallback).toHaveBeenCalledWith(mockItems[0])
  })

  it('should not render edit/delete buttons if callbacks not provided', () => {
    render(
      <CrudPage
        title="Test Management"
        apiEndpoint="/api/test"
        columns={mockColumns}
        renderForm={MockForm}
      />
    )

    const buttons = screen.getAllByRole('button')
    // Only Add button should be present, no edit/delete buttons
    expect(buttons.length).toBe(1)
  })
})
