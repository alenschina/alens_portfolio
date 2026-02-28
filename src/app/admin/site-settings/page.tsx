'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminSiteSettings } from '@/hooks/useSiteSettings'
import { LoadingSpinner } from '@/components/admin/LoadingSpinner'

export default function SiteSettingsPage() {
  const router = useRouter()
  const { settings, isLoading, mutate } = useAdminSiteSettings()

  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [beianIcpNumber, setBeianIcpNumber] = useState('')
  const [beianGongAnNumber, setBeianGongAnNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '')
      setSiteDescription(settings.siteDescription || '')
      setBeianIcpNumber(settings.beianIcpNumber || '')
      setBeianGongAnNumber(settings.beianGongAnNumber || '')
    }
  }, [settings])

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

      // Save ICP beian number
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'beianIcpNumber', value: beianIcpNumber })
      })

      // Save Gong An beian number
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'beianGongAnNumber', value: beianGongAnNumber })
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
            value={siteName}
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
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Professional photographer specializing in..."
          />
          <p className="text-sm text-gray-500">
            This will be used for SEO meta description
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filing Information (备案信息)</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="beianIcpNumber" className="block text-sm font-medium text-gray-700">
                ICP备案号
              </label>
              <input
                id="beianIcpNumber"
                type="text"
                value={beianIcpNumber}
                onChange={(e) => setBeianIcpNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="粤ICP备XXXXXXXX号"
              />
              <p className="text-sm text-gray-500">
                This will be displayed in the footer of the homepage
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="beianGongAnNumber" className="block text-sm font-medium text-gray-700">
                公安备案号
              </label>
              <input
                id="beianGongAnNumber"
                type="text"
                value={beianGongAnNumber}
                onChange={(e) => setBeianGongAnNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XXXXXXXXXXXXXXXX号"
              />
              <p className="text-sm text-gray-500">
                Public Security Filing Number
              </p>
            </div>
          </div>
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
