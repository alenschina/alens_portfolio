export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-96">
      <LoadingSpinner size="large" />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
}
