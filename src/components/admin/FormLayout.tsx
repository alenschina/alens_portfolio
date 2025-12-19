"use client"

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  onCancel?: () => void
  loading?: boolean
  submitLabel?: string
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  showCard?: boolean
}

/**
 * Reusable Form Layout Component
 * Provides consistent layout for all forms
 */
export function FormLayout({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save',
  secondaryAction,
  className = '',
  showCard = true
}: FormLayoutProps) {
  const formContent = (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Form Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-6 border-t">
        {secondaryAction && (
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={secondaryAction.onClick}
            disabled={loading}
          >
            {secondaryAction.label}
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}

        {onSubmit && (
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        )}
      </div>
    </form>
  )

  if (showCard) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          {formContent}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {formContent}
    </div>
  )
}
