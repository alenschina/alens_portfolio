"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface FormHeaderProps {
  title: string
  subtitle?: string
  onCancel?: () => void
  showCancel?: boolean
  loading?: boolean
  submitLabel?: string
  onSubmit?: () => void
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Reusable Form Header Component
 * Provides consistent header layout for all forms
 */
export function FormHeader({
  title,
  subtitle,
  onCancel,
  showCancel = true,
  loading = false,
  submitLabel = 'Save',
  onSubmit,
  secondaryAction,
  className = ''
}: FormHeaderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Title and Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-4">
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            onClick={secondaryAction.onClick}
            disabled={loading}
          >
            {secondaryAction.label}
          </Button>
        )}

        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}

        {onSubmit && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
