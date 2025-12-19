"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600">
                Critical Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                A critical error occurred. Please reload the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-gray-100 rounded-md">
                  <p className="text-sm font-mono text-red-600">{error.message}</p>
                  {error.stack && (
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  )}
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
                <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
