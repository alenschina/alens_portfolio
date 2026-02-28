# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Alens Photography Portfolio** - A full-stack Next.js 16 application with:
- Public frontend with auto-rotating image carousel
- Admin dashboard for content management
- Multi-level navigation system
- Category-based image organization
- Admin authentication system

## Tech Stack

- **Framework**: Next.js 16.0.10 with App Router
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19.2.1
- **Database**: SQLite + Prisma ORM v6.19.1
- **Auth**: NextAuth.js v4 with JWT sessions
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + Lucide React
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR
- **Image Processing**: Sharp
- **Tests**: Vitest + @testing-library (Happy-dom/jsdom)
- **DnD**: @dnd-kit for drag-and-drop ordering

## Commands

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build (includes copy-assets.js)
npm run start      # Run production build
npm run lint       # ESLint with auto-fix
npm run format     # Prettier auto-format
npm run format:check  # Check formatting

# Testing
npm run test       # Vitest dev mode
npm run test:ui    # Vitest with UI browser
npm run test:run   # Run tests once
npm run test:run -- src/test/validation.test.ts  # Run single test file
npm run test:coverage  # With coverage report

# Database
npx prisma migrate dev --name init  # Initialize database
npx prisma studio                   # GUI database editor
npx prisma generate                 # Generate Prisma Client
npx prisma migrate dev              # Create migration
node prisma/seed.js                 # Seed initial data
```

## Project Structure

```
src/
├── app/
│   ├── admin/           # Protected admin routes
│   │   ├── login/       # Public login page
│   │   ├── dashboard/   # Statistics
│   │   ├── navigation/  # Nav management
│   │   ├── categories/  # Category CRUD
│   │   ├── images/      # Image library
│   │   ├── about/       # About page editor
│   │   ├── contact/     # Contact page editor
│   │   ├── cleanup/     # Orphaned file cleanup
│   │   └── performance/ # Performance monitoring panel
│   ├── api/             # REST API endpoints
│   │   ├── auth/[...nextauth]/
│   │   ├── navigation/
│   │   ├── categories/
│   │   ├── images/
│   │   ├── upload/
│   │   ├── about/
│   │   ├── contact/
│   │   └── admin/cleanup/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Public homepage
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── admin/           # Admin components
│   ├── error/           # Error boundary/handler
│   └── performance/     # Performance UI components
├── hooks/               # Custom React hooks
│   ├── useApi.ts        # SWR data fetching hooks
│   ├── useCrud.ts       # CRUD operations
│   ├── useFileUpload.ts # File upload handling
│   ├── useCategorySelection.ts  # Category state management
│   └── usePerformanceMonitor.ts # Performance tracking
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   ├── api-client.ts       # API helpers with retry
│   ├── api-error-handler.ts # API error handling
│   ├── audit.ts            # Admin action logging (console only)
│   ├── cos.ts              # Tencent COS integration
│   ├── error-handler.ts    # Error boundary helpers
│   ├── performance-monitor.ts # Web Vitals tracking
│   ├── validation.ts       # Zod schemas
│   └── utils.ts            # Utility functions (cn, etc.)
├── types/
│   └── index.ts            # Centralized TypeScript types
└── middleware.ts           # Auth + security headers (Next.js)
```

## Database Schema

**SQLite with Prisma ORM** - 6 models:

1. **User** - Admin accounts with role (ADMIN/SUPER_ADMIN)
2. **Navigation** - Multi-level menu (self-referencing parentId, supports LINK/CATEGORY/PARENT/EXTERNAL types)
3. **Category** - Image categories with slug, coverImage, order
4. **Image** - Portfolio images with metadata, thumbnail, order
5. **CategoryImage** - Many-to-many join table with carousel support (isCarousel, carouselOrder, order)
6. **Settings** - Key-value store for site settings

## Key Architecture

### Authentication
- NextAuth.js credentials provider (email/password)
- JWT sessions with bcryptjs password hashing
- Middleware protection: `/admin/*` requires auth, `/admin/login` is public
- Role-based access: ADMIN, SUPER_ADMIN

### CI/CD Pipeline

- **GitHub Actions** (`.github/workflows/ci.yml`):
  - Runs on push to main/develop and PRs to main
  - Three sequential jobs: Lint & Format Check, Tests (with coverage), Build
  - Node.js 20, uses `npm ci` for deterministic installs
  - Uploads coverage report and build artifacts as artifacts

### Production Deployment

- **PM2** (`ecosystem.config.js`):
  - App name: `alens_portfolio`
  - Runs `npm start` in `/var/www/alens_portfolio`
  - Production database: `file:./prod.db` (NOT dev.db)
  - Logs at `/var/log/pm2/alens-portfolio-*.log`
  - Max memory: 1GB, autorestart enabled
  - Restart delay: 3s, max 5 restarts

- **Build Process** (`copy-assets.js`):
  - Runs automatically during `npm run build`
  - Copies Prisma folder to standalone output for production
  - Images stored in Tencent COS (not local uploads in production)

### API Design
RESTful endpoints with Zod validation:
- `GET/POST/PUT/DELETE /api/navigation` - Navigation CRUD
- `GET/POST/PUT/DELETE /api/categories` - Category CRUD
- `GET/POST/PUT/DELETE /api/images` - Image CRUD
- `GET /api/images/by-category?slug={slug}` - Get images by category slug
- `POST /api/upload` - Multipart file upload with Sharp processing
- `GET/POST /api/about` - About page data
- `GET/POST /api/contact` - Contact page data
- `GET /api/uploads/[...slug]` - Serve uploaded files
- `POST /api/admin/cleanup/orphan-files` - Clean orphaned COS files

### Data Fetching
- **SWR** for client-side caching (`useNavigation`, `useImagesByCategory`)
- Custom hooks in `src/hooks/useApi.ts`
- Three cache strategies in `CACHE_CONFIG`:
  - `STATIC`: 1 hour revalidation (navigation, categories)
  - `DYNAMIC`: 5 minutes revalidation (images)
  - `REALTIME`: 30 seconds revalidation (live data)

### API Client
- `src/lib/api-client.ts`: HTTP client with retry mechanism (3 attempts, exponential backoff)
- `src/lib/api-error-handler.ts`: Error handling with status-specific messages
  - 401 triggers redirect to login
  - 403 shows permission denied
  - 404 shows not found
  - 500 shows server error
- Supports file uploads with progress tracking

### Image Management
- Unsplash CDN for external portfolio images
- Local uploads in `public/uploads/`
- Tencent COS (Cloud Object Storage) for production uploads
- Sharp processing: auto-generate WebP thumbnails (400x300)
- Image URL patterns:
  - Original: `{cosBaseUrl}/{filename}` or `/uploads/{filename}`
  - Thumbnail: `{cosBaseUrl}/thumb-{filename}` or `/uploads/thumb-{filename}`
- Carousel: @dnd-kit for drag-and-drop ordering, displayed by `carouselOrder`
- Upload security: filename sanitization, MIME type validation, path traversal prevention, Sharp image verification
- Cleanup: Automatic COS file deletion when images are removed; Cleanup menu for orphaned files

### Security Headers
Middleware (`src/middleware.ts`) sets CSP, X-Frame-Options, HSTS, Referrer-Policy, etc.

### Performance Monitoring
`src/lib/performance-monitor.ts` tracks Web Vitals (FCP, LCP, CLS, TTFB, INP) with:
- Console and localStorage reporting in development
- Custom metric tracking and execution time measurement
- Long task observation (>50ms)
- Performance data export capability

### Validation
Zod schemas in `src/lib/validation.ts` with:
- Security sanitization (XSS prevention, angle bracket removal)
- Type-specific validation (navigation types, image URLs)
- `validateRequest()` helper for API route validation
- Password requirements: 8-128 chars, uppercase + lowercase + number
- Slug validation: lowercase, numbers, hyphens only (kebab-case)

### Utility Functions
`src/lib/utils.ts` exports common utilities:
- `cn()` - Tailwind class merging utility (uses clsx + tailwind-merge)
- `formatDate()` - Date formatting helper
- Other shared helper functions

### Audit Logging
`src/lib/audit.ts` tracks admin actions:
- Logs to console only (AuditLog model not yet in database schema)
- Action types: USER_*, IMAGE_*, CATEGORY_*, NAVIGATION_*, FILE_UPLOAD, etc.
- Captures IP address and user agent from requests

### Testing
- **Framework**: Vitest with @testing-library/react
- **DOM Environment**: happy-dom (default), jsdom available for complex DOM tests
- **Coverage**: @vitest/coverage-v8
- **Test files**: Located in `src/test/` directory with pattern `*.test.ts`
- **Setup**: `src/test/setup.ts` configures testing environment
- **Single test**: `npm run test:run -- src/test/validation.test.ts`

### Environment Variables (.env)
```
# Development
DATABASE_URL="file:./dev.db"

# Production (use prod.db, not dev.db)
DATABASE_URL="file:./prod.db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Tencent COS (optional, for production uploads)
COS_SECRET_ID=""
COS_SECRET_KEY=""
COS_BUCKET=""
COS_REGION=""
COS_BASE_URL=""
```

## Default Admin Account
```
Email: admin@alens.com
Password: admin123
```

## Path Aliases
`@/*` maps to `./src/*`

## Type System
All TypeScript types are centralized in `src/types/index.ts`:
- **Core entities**: `NavigationItem`, `Category`, `Image`, `CategoryImage`, `User`
- **Enums**: `NavigationType` (LINK/CATEGORY/PARENT/EXTERNAL), `UserRole` (ADMIN/SUPER_ADMIN)
- **API types**: `ApiListResponse`, `ApiSingleResponse`, `ApiErrorResponse`, `PaginationInfo`
- **Form types**: `CreateNavigationData`, `CreateCategoryData`, `CreateImageData`, etc.
- **Component props**: `ImageCarouselProps`, `NavigationMenuProps`, `ImageGalleryProps`

Types are organized by domain and re-exported from `src/types/index.ts` for clean imports.
