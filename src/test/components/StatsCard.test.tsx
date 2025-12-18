import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCard } from '@/components/admin/StatsCard'

describe('StatsCard Component', () => {
  it('should render with title and numeric value', () => {
    render(<StatsCard title="Total Users" value={42} />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render with title and string value', () => {
    render(<StatsCard title="Status" value="Active" />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should display loading state when loading prop is true', () => {
    render(<StatsCard title="Loading Test" value={100} loading={true} />)

    expect(screen.getByText('Loading Test')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('should display value when loading is false', () => {
    render(<StatsCard title="Data" value={999} loading={false} />)

    expect(screen.getByText('999')).toBeInTheDocument()
  })

  it('should display value when loading is undefined', () => {
    render(<StatsCard title="No Loading" value="test" />)

    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('should handle large numbers', () => {
    render(<StatsCard title="Large Number" value={9999999} />)

    expect(screen.getByText('9999999')).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(<StatsCard title="Zero" value={0} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render Card component structure', () => {
    render(<StatsCard title="Test" value={1} />)

    const card = screen.getByText('Test').closest('div')
    expect(card).toBeInTheDocument()
    expect(card?.tagName).toBe('DIV')
  })

  it('should apply correct styling classes', () => {
    render(<StatsCard title="Styled" value="value" />)

    const valueElement = screen.getByText('value')
    expect(valueElement).toHaveClass('text-4xl', 'font-bold')
  })

  it('should render with special characters in value', () => {
    render(<StatsCard title="Special" value="€1,234.56" />)

    expect(screen.getByText('€1,234.56')).toBeInTheDocument()
  })
})
