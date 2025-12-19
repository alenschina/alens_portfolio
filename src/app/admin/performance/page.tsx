'use client'

/**
 * Performance Monitoring Dashboard
 * Displays Web Vitals and custom performance metrics
 */

import { useState, useEffect } from 'react'
import {
  getStoredPerformanceData,
  getPerformanceSummary,
  clearStoredPerformanceData,
  exportPerformanceData,
  type PerformanceData,
} from '@/lib/performance-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [summary, setSummary] = useState<any>(null)

  const loadPerformanceData = () => {
    const data = getStoredPerformanceData()
    const perfSummary = getPerformanceSummary()
    setPerformanceData(data)
    setSummary(perfSummary)
  }

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const handleClearData = () => {
    clearStoredPerformanceData()
    loadPerformanceData()
  }

  const handleExportData = () => {
    const exportedData = exportPerformanceData()
    const blob = new Blob([JSON.stringify(exportedData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500'
      case 'needs-improvement':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRatingTextColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-700'
      case 'needs-improvement':
        return 'text-yellow-700'
      case 'poor':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Monitor Web Vitals and custom performance metrics
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={loadPerformanceData} variant="outline">
          Refresh Data
        </Button>
        <Button onClick={handleExportData} variant="outline">
          Export Data
        </Button>
        <Button onClick={handleClearData} variant="destructive">
          Clear All Data
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance</CardTitle>
                  <CardDescription>Summary of all collected metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Metrics</p>
                      <p className="text-2xl font-bold">{summary.totalMetrics}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <Badge
                        variant="secondary"
                        className={`${getRatingColor(summary.averageRating)} text-white`}
                      >
                        {summary.averageRating}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Good</p>
                        <p className="text-xl font-semibold text-green-600">
                          {summary.ratingCounts.good}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Needs Improvement</p>
                        <p className="text-xl font-semibold text-yellow-600">
                          {summary.ratingCounts['needs-improvement']}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Poor</p>
                        <p className="text-xl font-semibold text-red-600">
                          {summary.ratingCounts.poor}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metrics by Type</CardTitle>
                  <CardDescription>Performance breakdown by metric type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(summary.metricsByName).map(([name, data]: [string, any]) => (
                      <div key={name} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">{name}</h3>
                          <Badge
                            variant="outline"
                            className={getRatingTextColor(
                              data.ratings.good > data.ratings.poor
                                ? 'good'
                                : data.ratings.poor > data.ratings.good
                                ? 'poor'
                                : 'needs-improvement'
                            )}
                          >
                            Avg: {data.average.toFixed(2)}
                            {name === 'CLS' ? '' : 'ms'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-green-600">
                            ✅ Good: {data.ratings.good}
                          </div>
                          <div className="text-yellow-600">
                            ⚠️ Needs Improvement: {data.ratings['needs-improvement']}
                          </div>
                          <div className="text-red-600">
                            ❌ Poor: {data.ratings.poor}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Vitals Metrics</CardTitle>
              <CardDescription>Core Web Vitals tracking results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {performanceData
                  .filter((d) => ['FCP', 'LCP', 'CLS', 'TTFB', 'INP'].includes(d.metricName))
                  .slice(-20)
                  .map((metric, index) => (
                    <div
                      key={`${metric.metricName}-${metric.timestamp}-${index}`}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{metric.metricName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {metric.value.toFixed(2)}
                          {metric.metricName === 'CLS' ? '' : 'ms'}
                        </p>
                        <Badge
                          variant="outline"
                          className={getRatingTextColor(metric.rating)}
                        >
                          {metric.rating}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Metrics</CardTitle>
              <CardDescription>Complete list of performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {performanceData.slice(-50).map((metric, index) => (
                  <div
                    key={`${metric.metricName}-${metric.timestamp}-${index}`}
                    className="flex items-center justify-between border-b pb-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{metric.metricName}</p>
                      <p className="text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {metric.value.toFixed(2)}
                        {metric.metricName === 'CLS' ? '' : 'ms'}
                      </p>
                      <Badge
                        variant="outline"
                        className={getRatingTextColor(metric.rating)}
                      >
                        {metric.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
