'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Image {
  id: string
  alt: string
  originalUrl: string
  thumbnailUrl?: string
  category: { name: string }
  isCarousel: boolean
  isVisible: boolean
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/images')
        const data = await res.json()
        setImages(data)
      } catch (error) {
        console.error('Error fetching images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Images Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={image.thumbnailUrl || image.originalUrl}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-sm truncate">{image.alt}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-2">
                  Category: {image.category?.name}
                </p>
                <div className="flex gap-2 text-xs">
                  {image.isCarousel && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      Carousel
                    </span>
                  )}
                  {image.isVisible ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Visible
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      Hidden
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
