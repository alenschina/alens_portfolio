import useSWR from 'swr'

export interface SiteSettings {
  siteName: string
  siteDescription: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

/**
 * Hook to fetch site settings (public)
 */
export function useSiteSettings() {
  const { data, error, isLoading, mutate } = useSWR<SiteSettings>(
    '/api/site-settings',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  )

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate
  }
}

/**
 * Hook to fetch site settings for admin (with auth)
 */
export function useAdminSiteSettings() {
  const { data, error, isLoading, mutate } = useSWR<SiteSettings>(
    '/api/site-settings?admin=true',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  )

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate
  }
}
