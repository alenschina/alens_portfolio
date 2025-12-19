'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="text-gray-600 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex space-x-2 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
