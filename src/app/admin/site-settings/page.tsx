'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminSiteSettings } from '@/hooks/useSiteSettings'
import { LoadingSpinner } from '@/components/admin/LoadingSpinner'

export default function SiteSettingsPage() {
  const router = useRouter()
  const { settings, isLoading, mutate } = useAdminSiteSettings()

  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Initialize form when settings load
  useState(() => {
    if (settings) {
      setSiteName(settings.siteName)
      setSiteDescription(settings.siteDescription)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Save site name
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'siteName', value: siteName })
      })

      // Save site description
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'siteDescription', value: siteDescription })
      })

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      mutate()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
            Site Name
          </label>
          <input
            id="siteName"
            type="text"
            value={siteName || settings?.siteName || ''}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Photography Portfolio"
          />
          <p className="text-sm text-gray-500">
            This will appear in the browser tab title and page header
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
            Site Description
          </label>
          <textarea
            id="siteDescription"
            value={siteDescription || settings?.siteDescription || ''}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Professional photographer specializing in..."
          />
          <p className="text-sm text-gray-500">
            This will be used for SEO meta description
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
