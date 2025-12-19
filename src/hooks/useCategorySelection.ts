"use client"

import { useCallback } from 'react'
import type { Category } from '@/types'

interface CategorySelection {
  categoryId: string
  isCarousel: boolean
  carouselOrder?: number | null
  order: number
}

interface UseCategorySelectionOptions {
  categories: Category[]
  initialSelection?: CategorySelection[]
  maxCarouselItems?: number
}

interface UseCategorySelectionReturn {
  selectedCategories: CategorySelection[]
  toggleCategory: (categoryId: string) => CategorySelection[]
  updateCategoryCarousel: (categoryId: string, isCarousel: boolean, carouselOrder?: number) => CategorySelection[]
  reorderCategories: (startIndex: number, endIndex: number) => CategorySelection[]
  clearSelection: () => CategorySelection[]
  selectAll: () => CategorySelection[]
  isSelected: (categoryId: string) => boolean
  getSelectedCategory: (categoryId: string) => CategorySelection | undefined
  canAddMoreToCarousel: () => boolean
}

/**
 * Custom hook for managing category selection
 * Handles toggle, carousel settings, and ordering
 */
export function useCategorySelection(
  options: UseCategorySelectionOptions
): UseCategorySelectionReturn {
  const { categories, initialSelection = [], maxCarouselItems = 10 } = options

  const selectedCategories = initialSelection

  const toggleCategory = useCallback((categoryId: string) => {
    const index = selectedCategories.findIndex(c => c.categoryId === categoryId)

    if (index >= 0) {
      // Remove category
      selectedCategories.splice(index, 1)
      // Reorder remaining categories
      selectedCategories.forEach((cat, i) => {
        cat.order = i
      })
    } else {
      // Add category
      selectedCategories.push({
        categoryId,
        isCarousel: false,
        order: selectedCategories.length
      })
    }

    // Trigger re-render by returning new array
    return [...selectedCategories]
  }, [selectedCategories])

  const updateCategoryCarousel = useCallback((
    categoryId: string,
    isCarousel: boolean,
    carouselOrder?: number
  ) => {
    const category = selectedCategories.find(c => c.categoryId === categoryId)
    if (!category) return [...selectedCategories]

    // If enabling carousel, check limit
    if (isCarousel && !category.isCarousel) {
      const carouselCount = selectedCategories.filter(c => c.isCarousel).length
      if (carouselCount >= maxCarouselItems) {
        console.warn(`Maximum carousel items (${maxCarouselItems}) reached`)
        return [...selectedCategories]
      }
    }

    category.isCarousel = isCarousel
    category.carouselOrder = isCarousel ? (carouselOrder ?? 0) : null

    return [...selectedCategories]
  }, [selectedCategories, maxCarouselItems])

  const reorderCategories = useCallback((startIndex: number, endIndex: number) => {
    const result = [...selectedCategories]
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    // Update order for all categories
    result.forEach((cat, index) => {
      cat.order = index
    })

    return result
  }, [selectedCategories])

  const clearSelection = useCallback(() => {
    selectedCategories.length = 0
    return []
  }, [selectedCategories])

  const selectAll = useCallback(() => {
    selectedCategories.length = 0
    categories.forEach((cat, index) => {
      selectedCategories.push({
        categoryId: cat.id,
        isCarousel: false,
        order: index
      })
    })
    return [...selectedCategories]
  }, [categories, selectedCategories])

  const isSelected = useCallback((categoryId: string) => {
    return selectedCategories.some(c => c.categoryId === categoryId)
  }, [selectedCategories])

  const getSelectedCategory = useCallback((categoryId: string) => {
    return selectedCategories.find(c => c.categoryId === categoryId)
  }, [selectedCategories])

  const canAddMoreToCarousel = useCallback(() => {
    const carouselCount = selectedCategories.filter(c => c.isCarousel).length
    return carouselCount < maxCarouselItems
  }, [selectedCategories, maxCarouselItems])

  return {
    selectedCategories,
    toggleCategory,
    updateCategoryCarousel,
    reorderCategories,
    clearSelection,
    selectAll,
    isSelected,
    getSelectedCategory,
    canAddMoreToCarousel
  }
}
