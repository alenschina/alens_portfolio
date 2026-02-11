import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingPage, LoadingCard } from '@/components/admin/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  describe('LoadingSpinner', () => {
    it('should render with default size', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
    })

    it('should render with small size', () => {
      render(<LoadingSpinner size="small" />)

      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('should render with default size explicitly', () => {
      render(<LoadingSpinner size="default" />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })

    it('should render with large size', () => {
      render(<LoadingSpinner size="large" />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('h-12', 'w-12')
    })

    it('should have correct accessibility attributes', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('should have screen reader only text', () => {
      render(<LoadingSpinner />)

      expect(screen.getByText('Loading...')).toHaveClass('sr-only')
    })

    it('should have spinner animation class', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should have border style classes', () => {
      render(<LoadingSpinner />)

      const spinner = screen.getByRole('status')
      expect(spinner).toHaveClass('rounded-full', 'border-b-2', 'border-gray-900')
    })

    it('should be wrapped in a flex container', () => {
      render(<LoadingSpinner />)

      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('LoadingPage', () => {
    it('should render LoadingSpinner with large size', () => {
      render(<LoadingPage />)

      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
    })

    it('should have full height container', () => {
      render(<LoadingPage />)

      const container = screen.getByRole('status').parentElement?.parentElement
      expect(container).toHaveClass('h-96')
    })

    it('should center the spinner', () => {
      render(<LoadingPage />)

      const container = screen.getByRole('status').parentElement
      expect(container).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('LoadingCard', () => {
    it('should render with pulse animation', () => {
      const { container } = render(<LoadingCard />)

      expect(container.firstChild).toHaveClass('animate-pulse')
    })

    it('should have skeleton placeholder', () => {
      const { container } = render(<LoadingCard />)

      const skeleton = container.querySelector('.h-32.bg-gray-200.rounded')
      expect(skeleton).toBeInTheDocument()
    })

    it('should be wrapped in a div', () => {
      const { container } = render(<LoadingCard />)

      expect(container.firstChild?.tagName).toBe('DIV')
    })
  })
})
