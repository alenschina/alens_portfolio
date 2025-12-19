'use client'

/**
 * Performance Tracker Component
 * Integrates web-vitals with our performance monitoring system
 */

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import {
  trackCustomMetric,
  initializePerformanceMonitoring,
  registerReporter,
  consoleReporter,
  localStorageReporter,
  type PerformanceData,
} from '@/lib/performance-monitor'

// Custom reporter that combines console and local storage
const combinedReporter = (data: PerformanceData) => {
  consoleReporter(data)
  localStorageReporter(data)
}

// Initialize performance monitoring on module load
initializePerformanceMonitoring({
  reportToConsole: process.env.NODE_ENV === 'development',
  storeLocally: true,
  customReporters: [combinedReporter],
})

export function PerformanceTracker() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      trackCustomMetric('CLS', metric.value, {
        id: metric.id,
        navigationType: metric.navigationType,
      })
    })

    onFCP((metric) => {
      trackCustomMetric('FCP', metric.value, {
        id: metric.id,
        navigationType: metric.navigationType,
      })
    })

    onLCP((metric) => {
      trackCustomMetric('LCP', metric.value, {
        id: metric.id,
        navigationType: metric.navigationType,
      })
    })

    onTTFB((metric) => {
      trackCustomMetric('TTFB', metric.value, {
        id: metric.id,
        navigationType: metric.navigationType,
      })
    })

    onINP((metric) => {
      trackCustomMetric('INP', metric.value, {
        id: metric.id,
        navigationType: metric.navigationType,
      })
    })
  }, [])

  // This component doesn't render anything
  return null
}

export default PerformanceTracker
