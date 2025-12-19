"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'section'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // Report error to monitoring service (if configured)
    this.reportError(error, errorInfo)
  }

  reportError(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
    // Example implementation:
    /*
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }
    */
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI based on level
      const { level = 'component' } = this.props

      if (level === 'page') {
        return <PageError error={this.state.error} onRetry={this.handleRetry} />
      }

      if (level === 'section') {
        return (
          <SectionError
            error={this.state.error}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        )
      }

      return (
        <ComponentError
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Page-level error fallback
 */
function PageError({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-mono text-red-600">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={onRetry} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Section-level error fallback (for admin dashboard sections)
 */
function SectionError({
  error,
  onRetry,
  onReload
}: {
  error: Error | null
  onRetry: () => void
  onReload: () => void
}) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900">
            This section couldn't load
          </h3>
          <p className="text-sm text-gray-600">
            There was an error loading this content.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="text-left p-3 bg-gray-100 rounded-md">
              <p className="text-xs font-mono text-red-600">{error.message}</p>
            </div>
          )}
          <div className="flex justify-center space-x-2">
            <Button size="sm" onClick={onRetry}>
              Retry
            </Button>
            <Button size="sm" variant="outline" onClick={onReload}>
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Component-level error fallback (for small components)
 */
function ComponentError({
  error,
  onRetry
}: {
  error: Error | null
  onRetry: () => void
}) {
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-start space-x-3">
        <div className="text-red-600">⚠️</div>
        <div className="flex-1">
          <p className="text-sm text-red-800">Component error</p>
          {process.env.NODE_ENV === 'development' && error && (
            <p className="text-xs font-mono text-red-600 mt-1">
              {error.message}
            </p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  )
}
