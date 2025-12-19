"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useCategorySelection } from '@/hooks/useCategorySelection'
import type { Category } from '@/types'

interface CategorySelectorProps {
  categories: Category[]
  initialSelection?: {
    categoryId: string
    isCarousel: boolean
    carouselOrder?: number | null
    order: number
  }[]
  onSelectionChange?: (selection: {
    categoryId: string
    isCarousel: boolean
    carouselOrder?: number | null
    order: number
  }[]) => void
  maxCarouselItems?: number
  showCarouselSettings?: boolean
  className?: string
}

/**
 * Reusable Category Selector Component
 * Supports single/multi-selection with optional carousel configuration
 */
export function CategorySelector({
  categories,
  initialSelection = [],
  onSelectionChange,
  maxCarouselItems = 10,
  showCarouselSettings = true,
  className = ''
}: CategorySelectorProps) {
  const {
    selectedCategories,
    toggleCategory,
    updateCategoryCarousel,
    isSelected,
    getSelectedCategory,
    canAddMoreToCarousel
  } = useCategorySelection({
    categories,
    initialSelection,
    maxCarouselItems
  })

  // Notify parent of selection changes
  const notifySelectionChange = (newSelection: typeof selectedCategories) => {
    onSelectionChange?.(newSelection)
  }

  const handleToggleCategory = (categoryId: string) => {
    const newSelection = toggleCategory(categoryId)
    notifySelectionChange(newSelection)
  }

  const handleCarouselToggle = (
    categoryId: string,
    isCarousel: boolean
  ) => {
    if (!canAddMoreToCarousel() && isCarousel) {
      return // Don't allow if limit reached
    }
    const newSelection = updateCategoryCarousel(categoryId, isCarousel, 0)
    if (newSelection) {
      notifySelectionChange(newSelection)
    }
  }

  const handleCarouselOrderChange = (
    categoryId: string,
    order: number
  ) => {
    const newSelection = updateCategoryCarousel(categoryId, true, order)
    if (newSelection) {
      notifySelectionChange(newSelection)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-4 max-h-60 overflow-y-auto">
        {categories.map((category) => {
          const isChecked = isSelected(category.id)
          const categoryData = getSelectedCategory(category.id)

          return (
            <div
              key={category.id}
              className="space-y-2 p-2 border rounded-md"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggleCategory(category.id)
                  }
                />
                <Label htmlFor={`cat-${category.id}`} className="flex-1 cursor-pointer">
                  {category.name}
                </Label>
              </div>

              {isChecked && showCarouselSettings && categoryData && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`carousel-${category.id}`}
                      checked={categoryData.isCarousel || false}
                      disabled={
                        !categoryData.isCarousel && !canAddMoreToCarousel()
                      }
                      onCheckedChange={(checked) =>
                        handleCarouselToggle(category.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`carousel-${category.id}`}
                      className="cursor-pointer text-sm"
                    >
                      Carousel
                    </Label>
                    {!categoryData.isCarousel && !canAddMoreToCarousel() && (
                      <span className="text-xs text-amber-600">
                        (Max {maxCarouselItems})
                      </span>
                    )}
                  </div>

                  {categoryData.isCarousel && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`carousel-order-${category.id}`} className="text-xs">
                        Order:
                      </Label>
                      <Input
                        id={`carousel-order-${category.id}`}
                        type="number"
                        min="0"
                        className="h-8 w-20 text-sm"
                        value={categoryData.carouselOrder || 0}
                        onChange={(e) =>
                          handleCarouselOrderChange(
                            category.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="text-sm text-gray-600">
          Selected: {selectedCategories.length} category
          {selectedCategories.length !== 1 ? 'ies' : ''}
          {showCarouselSettings && (
            <>
              {' • '}
              {selectedCategories.filter(c => c.isCarousel).length} in carousel
            </>
          )}
        </div>
      )}
    </div>
  )
}
