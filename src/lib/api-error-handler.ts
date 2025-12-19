/**
 * API Error Handler with Retry Mechanism
 */

import { retry, isNetworkError, isAuthError, getErrorMessage } from './error-handler'

export interface ApiError extends Error {
  status?: number
  statusText?: string
  data?: any
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error implements ApiError {
  status?: number
  statusText?: string
  data?: any

  constructor(message: string, status?: number, data?: any) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.data = data
  }
}

/**
 * Enhanced fetch with error handling and retry
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: Parameters<typeof retry>[1] = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await retry(
      async () => {
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })

        // Parse response
        let data: any
        const contentType = res.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          data = await res.json()
        } else {
          data = await res.text()
        }

        // Check if response is ok
        if (!res.ok) {
          const error = new ApiException(
            data?.error || data?.message || `HTTP ${res.status}`,
            res.status,
            data
          )
          error.status = res.status
          error.statusText = res.statusText
          throw error
        }

        return { data, response: res }
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        retryCondition: (error: any) => {
          // Only retry on network errors or 5xx server errors
          if (isNetworkError(error)) return true
          if (error.status && error.status >= 500) return true
          return false
        },
        ...retryOptions
      }
    )

    return {
      data: response.data,
      success: true
    }
  } catch (error: any) {
    console.error('API Request failed:', error)

    // Handle specific error types
    let errorMessage = getErrorMessage(error)

    // Add specific messages for different status codes
    if (error.status === 401) {
      errorMessage = 'Authentication required. Please log in.'
      // TODO: Redirect to login page
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.'
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.'
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please try again later.'
    } else if (error.status && error.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    }

    return {
      error: errorMessage,
      success: false
    }
  }
}

/**
 * API methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(url: string, retryOptions?: Parameters<typeof retry>[1]) =>
    apiRequest<T>(url, { method: 'GET' }, retryOptions),

  post: <T = any>(url: string, data?: any, retryOptions?: Parameters<typeof retry>[1]) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  put: <T = any>(url: string, data?: any, retryOptions?: Parameters<typeof retry>[1]) =>
    apiRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  patch: <T = any>(url: string, data?: any, retryOptions?: Parameters<typeof retry>[1]) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, retryOptions),

  delete: <T = any>(url: string, retryOptions?: Parameters<typeof retry>[1]) =>
    apiRequest<T>(url, { method: 'DELETE' }, retryOptions),
}

/**
 * Hook for API calls with loading and error states
 */
export function useApi() {
  const request = async <T = any>(
    url: string,
    options?: RequestInit,
    retryOptions?: Parameters<typeof retry>[1]
  ) => {
    return apiRequest<T>(url, options, retryOptions)
  }

  return { request, api }
}

/**
 * File upload with progress and error handling
 */
export async function uploadFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve({ data, success: true })
        } catch {
          resolve({ data: xhr.responseText, success: true })
        }
      } else {
        let errorMessage = 'Upload failed'
        try {
          const data = JSON.parse(xhr.responseText)
          errorMessage = data.error || errorMessage
        } catch {
          errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`
        }
        resolve({ error: errorMessage, success: false })
      }
    })

    xhr.addEventListener('error', () => {
      resolve({ error: 'Network error during upload', success: false })
    })

    xhr.addEventListener('timeout', () => {
      resolve({ error: 'Upload timed out', success: false })
    })

    const formData = new FormData()
    formData.append('file', file)

    xhr.open('POST', url)
    xhr.timeout = 30000 // 30 seconds
    xhr.send(formData)
  })
}
