'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NavigationItem {
  id: string
  title: string
  slug: string
  type: string
  order: number
  isVisible: boolean
  children: NavigationItem[]
}

export default function NavigationPage() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await fetch('/api/navigation')
        const data = await res.json()
        setNavigation(data)
      } catch (error) {
        console.error('Error fetching navigation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNavigation()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Navigation Management</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          navigation.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.title} ({item.type})</span>
                  <span className="text-sm text-gray-500">Order: {item.order}</span>
                </CardTitle>
              </CardHeader>
              {item.children && item.children.length > 0 && (
                <CardContent>
                  <div className="ml-4 space-y-2">
                    {item.children.map((child) => (
                      <div key={child.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span>{child.title} ({child.type})</span>
                          <span className="text-sm text-gray-500">Order: {child.order}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
