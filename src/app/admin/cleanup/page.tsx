'use client'

/**
 * Cleanup Orphan Files Page
 * Lists and allows deletion of files in COS that are not referenced in the database
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'

interface OrphanFileResult {
  files: string[]
}

interface DeleteResult {
  deleted: number
  failed: number
}

export default function CleanupPage() {
  const [files, setFiles] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadOrphanFiles = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSelectedFiles(new Set())

    try {
      const response = await fetch('/api/admin/cleanup/orphan-files')
      if (!response.ok) {
        throw new Error('Failed to load orphan files')
      }
      const data: OrphanFileResult = await response.json()
      setFiles(data.files)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orphan files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrphanFiles()
  }, [])

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files))
    }
  }

  const toggleFile = (filename: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(filename)) {
      newSelected.delete(filename)
    } else {
      newSelected.add(filename)
    }
    setSelectedFiles(newSelected)
  }

  const handleDelete = async () => {
    if (selectedFiles.size === 0) return

    const filenames = Array.from(selectedFiles)
    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/cleanup/orphan-files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete files')
      }

      const result: DeleteResult = await response.json()
      setSuccess(`Successfully deleted ${result.deleted} file(s). ${result.failed} failed.`)

      // Refresh the list
      await loadOrphanFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cleanup Orphan Files</h1>
        <p className="text-muted-foreground mt-2">
          Find and delete files in COS storage that are not referenced in the database
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={loadOrphanFiles} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh List
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={selectedFiles.size === 0 || deleting}
        >
          {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete Selected ({selectedFiles.size})
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Orphan Files ({files.length})</CardTitle>
          <CardDescription>
            These files exist in COS storage but are not referenced in any database records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No orphan files found. Your COS storage is clean.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Checkbox
                  checked={selectedFiles.size === files.length && files.length > 0}
                  onCheckedChange={toggleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All
                </label>
              </div>
              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {files.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <Checkbox
                      checked={selectedFiles.has(filename)}
                      onCheckedChange={() => toggleFile(filename)}
                      id={`file-${filename}`}
                    />
                    <label htmlFor={`file-${filename}`} className="text-sm font-mono flex-1">
                      {filename}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
