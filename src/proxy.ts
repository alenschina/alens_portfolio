import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const response = NextResponse.next()

    // Security Headers Configuration
    // ===============================

    // 1. Content Security Policy (CSP)
    // Prevents XSS attacks by controlling which resources can be loaded
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "img-src 'self' data: https://images.unsplash.com blob:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "font-src 'self' data:",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    )

    // 2. X-Frame-Options
    // Prevents clickjacking attacks
    response.headers.set('X-Frame-Options', 'DENY')

    // 3. X-Content-Type-Options
    // Prevents MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // 4. X-XSS-Protection
    // Enables browser XSS filtering
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // 5. Referrer-Policy
    // Controls referrer information sent with requests
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 6. Permissions-Policy
    // Controls which browser features can be used
    response.headers.set(
      'Permissions-Policy',
      [
        'accelerometer=()',
        'camera=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'payment=()',
        'usb=()',
        'fullscreen=(self)',
        'sync-xhr=()'
      ].join(', ')
    )

    // 7. Strict Transport Security (HSTS)
    // Forces HTTPS connections
    if (req.nextUrl.protocol === 'https:') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    // 8. Hide server information
    response.headers.delete('X-Powered-By')

    // Cache Control for Admin Pages
    // ==============================
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Don't cache admin pages
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 允许访问登录页面
        if (pathname === '/admin/login') {
          return true
        }

        // 其他 admin 页面需要认证
        return !!token
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
