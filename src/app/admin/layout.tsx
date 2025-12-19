import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ReactNode, Suspense } from 'react'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ErrorBoundary level="section">
        <AdminSidebar />
      </ErrorBoundary>
      <main className="flex-1 p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <ErrorBoundary level="section">
            {children}
          </ErrorBoundary>
        </Suspense>
      </main>
    </div>
  )
}
