// =============================================================================
// Type Guards for Runtime Type Checking
// =============================================================================

import { NavigationType } from './index'

// Navigation Type Guards
export function isNavigationType(value: string): value is NavigationType {
  return Object.values(NavigationType).includes(value as NavigationType)
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}

// Category Type Guards
export function isCategory(item: any): item is { id: string; name: string; slug: string } {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.slug === 'string'
  )
}

// Image Type Guards
export function isImage(item: any): item is { id: string; alt: string; originalUrl: string } {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.alt === 'string' &&
    typeof item.originalUrl === 'string'
  )
}

// Generic Type Guards
export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean'
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Form Data Type Guards
export function isNavigationFormData(data: any): data is { type: string } {
  return data && typeof data.type === 'string'
}

// Safe Type Assertion Helper
export function assertNavigationType(value: string): NavigationType {
  if (!isNavigationType(value)) {
    throw new Error(`Invalid navigation type: ${value}`)
  }
  return value
}

export function assertSlug(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug format: ${slug}`)
  }
  return slug
}
