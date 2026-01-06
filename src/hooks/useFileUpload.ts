"use client"

import { useState, useCallback } from 'react'
import type { UploadedFileData } from '@/types'

interface UseFileUploadOptions {
  uploadEndpoint?: string
  onSuccess?: (data: UploadedFileData) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in bytes
}

interface UseFileUploadReturn {
  uploading: boolean
  uploadProgress: number
  uploadedData: UploadedFileData | null
  error: string | null
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  reset: () => void
  inputProps: {
    type: 'file'
    accept: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
    disabled: boolean
  }
}

/**
 * Custom hook for handling file uploads
 * Extracts file upload logic from components
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    uploadEndpoint = '/api/upload',
    onSuccess,
    onError,
    accept = 'image/*',
    maxSize = 50 * 1024 * 1024 // 50MB default
  } = options

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedData, setUploadedData] = useState<UploadedFileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }

    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileType = file.type.toLowerCase()

      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(baseType)
        }
        return fileType === type
      })

      if (!isValidType) {
        return `File type not supported. Accepted types: ${accept}`
      }
    }

    return null
  }

  const uploadFile = useCallback(async (file: File): Promise<UploadedFileData> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data)
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.error || `Upload failed: ${xhr.statusText}`))
          } catch {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'))
      })

      const formData = new FormData()
      formData.append('file', file)

      xhr.open('POST', uploadEndpoint)
      xhr.timeout = 30000 // 30 seconds
      xhr.send(formData)
    })
  }, [uploadEndpoint])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      onError?.(validationError)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const data = await uploadFile(file)
      setUploadedData(data)
      onSuccess?.(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      event.target.value = ''
    }
  }, [uploadFile, onSuccess, onError, accept, maxSize])

  const reset = useCallback(() => {
    setUploading(false)
    setUploadProgress(0)
    setUploadedData(null)
    setError(null)
  }, [])

  return {
    uploading,
    uploadProgress,
    uploadedData,
    error,
    handleFileChange,
    reset,
    inputProps: {
      type: 'file',
      accept,
      onChange: handleFileChange,
      disabled: uploading
    }
  }
}
