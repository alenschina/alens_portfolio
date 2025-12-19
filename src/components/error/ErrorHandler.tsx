"use client"

import { useEffect } from 'react'
import { initializeErrorHandlers } from '@/lib/error-handler'

/**
 * Component that initializes global error handlers
 * Should be placed once in the root layout
 */
export function ErrorHandler() {
  useEffect(() => {
    initializeErrorHandlers()
  }, [])

  return null
}
