/**
 * Custom Hook for Performance Monitoring
 * Provides easy-to-use performance tracking utilities
 */

import { useCallback, useRef } from 'react'
import { trackCustomMetric, measureExecutionTime, measureAsyncExecutionTime } from '@/lib/performance-monitor'

export function usePerformanceMonitor() {
  const metricCounters = useRef<Record<string, number>>({})

  /**
   * Track a custom metric
   */
  const trackMetric = useCallback(
    (name: string, value: number, additionalData?: Record<string, any>) => {
      trackCustomMetric(name, value, additionalData)
    },
    []
  )

  /**
   * Measure and track function execution time (sync)
   */
  const measureTime = useCallback(
    <T>(name: string, fn: () => T, additionalData?: Record<string, any>): T => {
      return measureExecutionTime(name, fn, additionalData)
    },
    []
  )

  /**
   * Measure and track async function execution time
   */
  const measureAsyncTime = useCallback(
    async <T>(name: string, fn: () => Promise<T>, additionalData?: Record<string, any>): Promise<T> => {
      return measureAsyncExecutionTime(name, fn, additionalData)
    },
    []
  )

  /**
   * Increment a counter metric
   */
  const incrementCounter = useCallback(
    (name: string, value = 1, additionalData?: Record<string, any>) => {
      const current = metricCounters.current[name] || 0
      metricCounters.current[name] = current + value
      trackCustomMetric(`${name}_counter`, current + value, additionalData)
    },
    []
  )

  /**
   * Track component render time
   */
  const trackRenderTime = useCallback(
    (componentName: string) => {
      const start = performance.now()
      return () => {
        const end = performance.now()
        trackCustomMetric(`${componentName}_render_time`, end - start, {
          component: componentName,
        })
      }
    },
    []
  )

  /**
   * Track API call duration
   */
  const trackApiCall = useCallback(
    async <T>(endpoint: string, apiFn: () => Promise<T>): Promise<T> => {
      return measureAsyncTime(`api_${endpoint}`, apiFn, { endpoint })
    },
    [measureAsyncTime]
  )

  /**
   * Track user interaction
   */
  const trackInteraction = useCallback(
    (action: string, additionalData?: Record<string, any>) => {
      trackCustomMetric(`user_interaction_${action}`, 1, {
        timestamp: Date.now(),
        ...additionalData,
      })
    },
    []
  )

  return {
    trackMetric,
    measureTime,
    measureAsyncTime,
    incrementCounter,
    trackRenderTime,
    trackApiCall,
    trackInteraction,
  }
}

export default usePerformanceMonitor
