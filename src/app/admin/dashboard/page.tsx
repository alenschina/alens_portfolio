'use client'

import { StatsCard } from '@/components/admin/StatsCard'
import { useDashboardStats } from '@/hooks/useApi'

export default function DashboardPage() {
  const { stats, isLoading, isError } = useDashboardStats()

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading dashboard data</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Categories" value={stats.totalCategories} loading={isLoading} />
        <StatsCard title="Images" value={stats.totalImages} loading={isLoading} />
        <StatsCard title="Navigation Items" value={stats.totalNavigationItems} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <StatsCard title="Visible Images" value={stats.visibleImages} loading={isLoading} />
        <StatsCard title="Carousel Images" value={stats.carouselImages} loading={isLoading} />
      </div>
    </div>
  )
}
