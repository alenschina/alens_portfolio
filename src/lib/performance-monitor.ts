/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom performance metrics
 */

import type { Metric } from 'web-vitals'

// Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte

  // Additional metrics
  INP: { good: 200, poor: 500 },    // Interaction to Next Paint
}

// Performance data interface
export interface PerformanceData {
  metricName: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  additionalData?: Record<string, any>
}

// Performance reporter function type
export type PerformanceReporter = (data: PerformanceData) => void

// Default reporters
const reporters: PerformanceReporter[] = []

/**
 * Register a performance reporter
 */
export function registerReporter(reporter: PerformanceReporter) {
  reporters.push(reporter)
}

/**
 * Unregister a performance reporter
 */
export function unregisterReporter(reporter: PerformanceReporter) {
  const index = reporters.indexOf(reporter)
  if (index > -1) {
    reporters.splice(index, 1)
  }
}

/**
 * Get performance rating based on thresholds
 */
function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS]

  if (!threshold) {
    return 'needs-improvement'
  }

  if (value <= threshold.good) {
    return 'good'
  } else if (value <= threshold.poor) {
    return 'needs-improvement'
  } else {
    return 'poor'
  }
}

/**
 * Create performance data object
 */
function createPerformanceData(
  metric: Metric | { name: string; value: number },
  additionalData?: Record<string, any>
): PerformanceData {
  return {
    metricName: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    additionalData,
  }
}

/**
 * Report performance data to all registered reporters
 */
function report(metric: Metric | { name: string; value: number }, additionalData?: Record<string, any>) {
  const data = createPerformanceData(metric, additionalData)

  reporters.forEach((reporter) => {
    try {
      reporter(data)
    } catch (error) {
      console.error('Performance reporter error:', error)
    }
  })
}

/**
 * Console reporter - logs performance data to console
 */
export function consoleReporter(data: PerformanceData) {
  const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌'
  console.log(`${emoji} [Performance] ${data.metricName}: ${data.value.toFixed(2)}${getMetricUnit(data.metricName)} (${data.rating})`)
}

/**
 * Get metric unit
 */
function getMetricUnit(metricName: string): string {
  switch (metricName) {
    case 'CLS':
      return ''
    case 'FCP':
    case 'LCP':
    case 'TTFB':
    case 'INP':
      return 'ms'
    default:
      return ''
  }
}

/**
 * Local storage reporter - stores performance data locally
 */
export function localStorageReporter(data: PerformanceData) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  try {
    const key = 'performance_data'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')

    // Keep only last 100 entries
    const updated = [...existing, data].slice(-100)

    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to store performance data:', error)
  }
}

/**
 * Fetch reporter - sends data to API endpoint
 */
export function fetchReporter(endpoint: string) {
  return (data: PerformanceData) => {
    if (typeof window === 'undefined') {
      return
    }

    // Send data to API (fire and forget)
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error('Failed to send performance data:', error)
    })
  }
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(options: {
  reportToConsole?: boolean
  storeLocally?: boolean
  sendToApi?: string
  customReporters?: PerformanceReporter[]
} = {}) {
  const {
    reportToConsole = true,
    storeLocally = true,
    sendToApi,
    customReporters = [],
  } = options

  // Register default reporters
  if (reportToConsole) {
    registerReporter(consoleReporter)
  }

  if (storeLocally) {
    registerReporter(localStorageReporter)
  }

  if (sendToApi) {
    registerReporter(fetchReporter(sendToApi))
  }

  // Register custom reporters
  customReporters.forEach(registerReporter)

  console.log('📊 Performance monitoring initialized')
}

/**
 * Track custom performance metric
 */
export function trackCustomMetric(
  name: string,
  value: number,
  additionalData?: Record<string, any>
) {
  report({ name, value }, additionalData)
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  name: string,
  fn: () => T,
  additionalData?: Record<string, any>
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  trackCustomMetric(`${name}_execution_time`, end - start, additionalData)

  return result
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  name: string,
  fn: () => Promise<T>,
  additionalData?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()

  trackCustomMetric(`${name}_execution_time`, end - start, additionalData)

  return result
}

/**
 * Get stored performance data
 */
export function getStoredPerformanceData(): PerformanceData[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  try {
    const data = localStorage.getItem('performance_data')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to get stored performance data:', error)
    return []
  }
}

/**
 * Clear stored performance data
 */
export function clearStoredPerformanceData(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  localStorage.removeItem('performance_data')
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  const data = getStoredPerformanceData()

  if (data.length === 0) {
    return {
      totalMetrics: 0,
      averageRating: 'good',
      metricsByName: {},
    }
  }

  const metricsByName = data.reduce((acc, curr) => {
    if (!acc[curr.metricName]) {
      acc[curr.metricName] = {
        count: 0,
        total: 0,
        values: [],
        ratings: { good: 0, 'needs-improvement': 0, poor: 0 },
      }
    }

    acc[curr.metricName].count++
    acc[curr.metricName].total += curr.value
    acc[curr.metricName].values.push(curr.value)
    acc[curr.metricName].ratings[curr.rating]++

    return acc
  }, {} as Record<string, any>)

  // Calculate averages
  Object.keys(metricsByName).forEach((name) => {
    const metric = metricsByName[name]
    metric.average = metric.total / metric.count
  })

  // Calculate overall rating
  const allRatings = data.map((d) => d.rating)
  const ratingCounts = {
    good: allRatings.filter((r) => r === 'good').length,
    'needs-improvement': allRatings.filter((r) => r === 'needs-improvement').length,
    poor: allRatings.filter((r) => r === 'poor').length,
  }

  const averageRating =
    ratingCounts.poor > data.length * 0.2
      ? 'poor'
      : ratingCounts['needs-improvement'] > data.length * 0.2
      ? 'needs-improvement'
      : 'good'

  return {
    totalMetrics: data.length,
    averageRating,
    ratingCounts,
    metricsByName,
  }
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback: (entry: PerformanceEntry) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          callback(entry)
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
  } catch (error) {
    console.error('Failed to observe long tasks:', error)
  }
}

/**
 * Export performance data as JSON
 */
export function exportPerformanceData() {
  const data = getStoredPerformanceData()
  const summary = getPerformanceSummary()

  return {
    summary,
    data,
    exportedAt: new Date().toISOString(),
  }
}

// Initialize with default reporters in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  initializePerformanceMonitoring({
    reportToConsole: true,
    storeLocally: true,
  })
}
