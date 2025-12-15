'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface Stats {
  categories: number
  images: number
  navigation: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    images: 0,
    navigation: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, imagesRes, navigationRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/images'),
          fetch('/api/navigation')
        ])

        const categories = await categoriesRes.json()
        const images = await imagesRes.json()
        const navigation = await navigationRes.json()

        setStats({
          categories: categories.length,
          images: images.length,
          navigation: navigation.length
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? '...' : stats.categories}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? '...' : stats.images}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? '...' : stats.navigation}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
