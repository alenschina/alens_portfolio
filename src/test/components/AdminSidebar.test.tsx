import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signOut: vi.fn()
}))

describe('AdminSidebar', () => {
  it('should render all navigation items', () => {
    render(<AdminSidebar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Cleanup')).toBeInTheDocument()
  })

  it('should render admin panel title', () => {
    render(<AdminSidebar />)

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('should render sign out button', () => {
    render(<AdminSidebar />)

    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<AdminSidebar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('flex', 'items-center', 'px-4', 'py-3')
  })
})
