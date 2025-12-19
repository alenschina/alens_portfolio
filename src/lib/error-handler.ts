/**
 * Global Error Handler
 * Handles unhandled JavaScript errors and unhandled promise rejections
 */

export interface ErrorReport {
  message: string
  stack?: string
  url?: string
  lineNumber?: number
  columnNumber?: number
  timestamp: Date
  userAgent?: string
  userId?: string
  additionalContext?: Record<string, any>
}

/**
 * Initialize global error handlers
 */
export function initializeErrorHandlers() {
  if (typeof window === 'undefined') {
    return // Only run in browser
  }

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const error: ErrorReport = {
      message: event.message,
      stack: event.error?.stack,
      url: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    }

    console.error('Global error:', error)
    reportError(error)
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error: ErrorReport = {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      additionalContext: {
        reason: event.reason
      }
    }

    console.error('Unhandled promise rejection:', error)
    reportError(error)

    // Prevent the default behavior (logging to console)
    event.preventDefault()
  })

  console.log('✅ Global error handlers initialized')
}

/**
 * Report error to monitoring service
 */
function reportError(error: ErrorReport) {
  // TODO: Integrate with error reporting service
  // Example implementations:

  // Sentry
  /*
  if (window.Sentry) {
    window.Sentry.captureException(new Error(error.message), {
      extra: error.additionalContext,
    })
  }
  */

  // LogRocket
  /*
  if (window.LogRocket) {
    window.LogRocket.captureException(error.message, {
      extra: error.additionalContext,
    })
  }
  */

  // Custom API endpoint
  /*
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(error),
  }).catch(err => {
    console.error('Failed to report error:', err)
  })
  */

  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Report')
    console.log('Message:', error.message)
    if (error.stack) console.log('Stack:', error.stack)
    if (error.url) console.log('URL:', error.url)
    if (error.lineNumber) console.log('Line:', error.lineNumber)
    if (error.additionalContext) {
      console.log('Context:', error.additionalContext)
    }
    console.groupEnd()
  }
}

/**
 * Create a safe async function wrapper
 */
export function safeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const message = errorMessage || 'An async operation failed'
      console.error(message, error)
      reportError({
        message,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        additionalContext: { args }
      })
      return null
    }
  }
}

/**
 * Create a safe sync function wrapper
 */
export function safeSync<T extends any[], R>(
  fn: (...args: T) => R,
  errorMessage?: string
) {
  return (...args: T): R | null => {
    try {
      return fn(...args)
    } catch (error) {
      const message = errorMessage || 'A sync operation failed'
      console.error(message, error)
      reportError({
        message,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        additionalContext: { args }
      })
      return null
    }
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
    retryCondition?: (error: any) => boolean
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = () => true
  } = options

  let lastError: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      )

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.name === 'NetworkError' ||
    error?.message?.includes('Failed to fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    !navigator.onLine
  )
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.message?.includes('Unauthorized') ||
    error?.message?.includes('Forbidden')
  )
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return (
    error?.status === 400 ||
    error?.status === 422 ||
    error?.message?.includes('Validation')
  )
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }

  if (error?.message) {
    return error.message
  }

  if (error?.error?.message) {
    return error.error.message
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.'
  }

  if (isAuthError(error)) {
    return 'Authentication error. Please log in again.'
  }

  if (isValidationError(error)) {
    return 'Invalid input. Please check your data and try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}

/**
 * Global type declaration for error reporting services
 */
declare global {
  interface Window {
    Sentry?: any
    LogRocket?: any
  }
}
