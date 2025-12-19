"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Application Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Something went wrong. Our team has been notified.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-sm font-mono text-red-600">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={reset} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
