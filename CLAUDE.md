# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is **Alens Photography Portfolio** - a complete full-stack web application built with Next.js 16, featuring:
- A public frontend showcasing photographic work through an auto-rotating image carousel
- A comprehensive admin dashboard for content management
- Dynamic navigation system with multi-level menu support
- Category-based image organization
- Admin authentication and authorization system

The site has evolved from a static portfolio to a fully dynamic, database-driven application with complete CRUD functionality.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 16.0.8 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS v4 (using `@import "tailwindcss"` in globals.css)
- **Compiler**: React Compiler enabled (babel-plugin-react-compiler)

### Backend & Database
- **Database**: SQLite + Prisma ORM v6.19.1
- **Authentication**: NextAuth.js v4.24.13 with JWT sessions
- **Password Hashing**: bcryptjs v3.0.3
- **Form Validation**: Zod v4.1.13 + React Hook Form v7.68.0
- **Image Processing**: Sharp v0.34.5

### UI & Components
- **Component Library**: shadcn/ui (built on Radix UI)
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **File Upload**: react-dropzone
- **Form Handling**: @hookform/resolvers

### Fonts & Assets
- **Fonts**: Geist and Geist_Mono (via next/font)
- **Images**: Unsplash CDN for portfolio images, local storage for uploads

## Common Development Commands

### Development Server
```bash
npm run dev
# Opens http://localhost:3000 with hot reload
# Uses Turbopack for faster builds
```

### Production Build
```bash
npm run build
# Creates optimized production build in .next/

npm run start
# Runs production build (requires build first)
```

### Linting
```bash
npm run lint
# ESLint checks using Next.js TypeScript configs
```

### Database Operations
```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Reset database and re-run migrations
rm prisma/dev.db
npx prisma migrate dev --name init

# Run seed script to populate initial data
node prisma/seed.js

# Generate Prisma Client after schema changes
npx prisma generate
```

**Note:** No test scripts configured (no Jest, Vitest, or Cypress installed)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin Dashboard Routes
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   ├── page.tsx             # Root admin page (redirects to dashboard)
│   │   ├── login/page.tsx       # Login page (public, not protected)
│   │   ├── dashboard/page.tsx   # Dashboard with statistics
│   │   ├── navigation/page.tsx  # Navigation management
│   │   ├── categories/page.tsx  # Category management
│   │   └── images/page.tsx      # Image library management
│   │
│   ├── api/                      # API Routes (RESTful)
│   │   ├── auth/
│   │   │   └── [...nextauth]/   # NextAuth endpoints
│   │   ├── navigation/          # Navigation CRUD
│   │   ├── categories/          # Category CRUD
│   │   ├── images/              # Image CRUD
│   │   └── upload/              # File upload handler
│   │
│   ├── globals.css              # Global styles with Tailwind imports
│   ├── layout.tsx               # Root layout (HTML structure, fonts, metadata)
│   └── page.tsx                 # Public homepage with dynamic content
│
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   │
│   └── admin/                   # Admin-specific components
│       └── AdminSidebar.tsx     # Sidebar navigation component
│
├── lib/                          # Utility Libraries
│   ├── prisma.ts                # Prisma Client instance
│   ├── auth.ts                  # NextAuth configuration
│   └── api-client.ts            # Client-side API helpers
│
└── types/                        # TypeScript Type Definitions
    └── next-auth.d.ts           # NextAuth session/user types

prisma/
├── schema.prisma                # Database schema (5 models)
├── seed.js                      # Database seed script
└── migrations/                  # Prisma migrations

public/
├── uploads/                     # Uploaded images directory
└── favicon.ico
```

## Architecture Notes

### Database Schema

The application uses **SQLite** with Prisma ORM. Database models:

1. **User** - Admin user accounts with role-based access
   - Fields: id, email, name, passwordHash, role, timestamps

2. **Navigation** - Multi-level navigation menu system
   - Fields: id, title, slug, type (LINK/CATEGORY/PARENT/EXTERNAL), parentId (self-referencing), categoryId, order, isVisible
   - Supports hierarchical menu structure (parent-child relationships)

3. **Category** - Portfolio categories for organizing images
   - Fields: id, name, slug, description, coverImage, order, isActive

4. **Image** - Portfolio images with metadata
   - Fields: id, title, alt, description, originalUrl, thumbnailUrl, width, height, size, mimeType, categoryId, isCarousel, carouselOrder, order, isVisible
   - Links to Category via foreign key

5. **Settings** - Key-value store for site configuration
   - Fields: id, key, value, updatedAt

### Authentication & Authorization

- **NextAuth.js v4** with credentials provider (email/password)
- JWT-based session management
- Password hashing with bcryptjs
- Middleware-based route protection (see `src/proxy.ts`)
- Role-based access control (ADMIN/SUPER_ADMIN)
- Login page at `/admin/login` is public, all other admin routes are protected

### API Design

RESTful API endpoints following Next.js App Router conventions:

- `GET /api/navigation` - Fetch navigation tree
- `POST /api/navigation` - Create navigation item
- `GET /api/navigation/[id]` - Get single navigation item
- `PUT /api/navigation/[id]` - Update navigation item
- `DELETE /api/navigation/[id]` - Delete navigation item

- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create category
- `GET /api/categories/[categoryId]` - Get single category
- `PUT /api/categories/[categoryId]` - Update category
- `DELETE /api/categories/[categoryId]` - Delete category

- `GET /api/images` - Fetch all images
- `POST /api/images` - Create image record
- `GET /api/images/[id]` - Get single image
- `PUT /api/images/[id]` - Update image
- `DELETE /api/images/[id]` - Delete image
- `GET /api/images/by-category?slug={slug}` - Get images by category slug

- `POST /api/upload` - Upload image file (multipart form data)

All mutations require authentication. API routes include Zod schema validation.

### Frontend Architecture

#### Public Site (`src/app/page.tsx`)
- Client-side component with `"use client"` directive
- **Dynamic data loading**: Fetches navigation and images from API
- **Image carousel**: Auto-rotating slideshow (5-second intervals) with manual controls
- **Category switching**: Dynamic navigation that loads images for selected category
- **Responsive design**: Mobile (single-column) and desktop (two-column) layouts
- **Loading states**: Spinner during data fetch
- **Error handling**: Error boundary with retry button

#### Admin Dashboard
- Protected routes via middleware
- Admin layout with sidebar navigation (`src/components/admin/AdminSidebar.tsx`)
- Dashboard shows statistics (category count, image count, navigation items)
- Management pages for CRUD operations
- Uses shadcn/ui components for consistent UI

### Styling & Theming

- **Tailwind CSS v4** with `@import "tailwindcss"` syntax
- Custom CSS variables in `:root` for theme colors
- Dark mode support via `prefers-color-scheme` media query
- Responsive breakpoints: `lg` (1024px) for desktop layout

### Image Management

- **External images**: Unsplash CDN for portfolio images
- **Local uploads**: Stored in `public/uploads/` directory
- **Upload API**: Processes files with Sharp for:
  - Automatic thumbnail generation (400x300, WebP format)
  - Metadata extraction (width, height, size, MIME type)
- Image URLs: `/uploads/{filename}` for originals, `/uploads/thumb-{filename}` for thumbnails

### Path Aliases

TypeScript configured with path alias: `@/*` maps to `./src/*`
```typescript
import { prisma } from '@/lib/prisma'  // instead of ../../lib/prisma
```

### React Compiler

- React Compiler enabled in `next.config.ts` (`reactCompiler: true`)
- Uses `babel-plugin-react-compiler` for automatic optimization
- Compiler may optimize component re-renders - no special handling needed

### ESLint Configuration

- Uses `eslint-config-next` with TypeScript support
- Includes Next.js core web vitals rules
- Ignores `.next/`, `out/`, `build/` directories

## Important Files

### Configuration Files
- **next.config.ts**:
  - React Compiler enabled
  - Image optimization: AVIF/WebP formats, responsive sizes
  - Remote patterns: images.unsplash.com configured

- **tsconfig.json**: TypeScript config with strict mode and path aliases
- **eslint.config.mjs**: ESLint configuration
- **postcss.config.mjs**: PostCSS config for Tailwind CSS v4
- **tailwind.config.js**: Tailwind CSS v4 configuration

### Core Application Files
- **src/app/layout.tsx**: Root layout with Geist fonts and metadata
- **src/app/globals.css**: Global styles and Tailwind imports
- **src/app/page.tsx**: Public homepage with dynamic content loading
- **src/app/admin/layout.tsx**: Admin dashboard layout
- **src/lib/prisma.ts**: Prisma Client singleton instance
- **src/lib/auth.ts**: NextAuth configuration with credentials provider
- **src/lib/api-client.ts**: Client-side API helper functions
- **src/proxy.ts**: NextAuth middleware for route protection

### Database
- **prisma/schema.prisma**: Complete database schema with 5 models
- **prisma/seed.js**: Seed script populating initial data
- **prisma/migrations/**: Database migration history

### Default Admin Account
```
Email: admin@alens.com
Password: admin123
Role: SUPER_ADMIN
```

## URL Structure

### Public Site
- `/` - Homepage with image carousel
- Dynamic content loaded via API calls

### Admin Dashboard
- `/admin` - Redirects to login (if not authenticated) or dashboard
- `/admin/login` - Public login page
- `/admin/dashboard` - Statistics dashboard
- `/admin/navigation` - Navigation management
- `/admin/categories` - Category management
- `/admin/images` - Image library management

## Development Notes

### Current Status
- ✅ Complete full-stack application
- ✅ Production-ready code
- ✅ 100% TypeScript coverage
- ✅ Comprehensive admin system
- ✅ RESTful API architecture
- ✅ Authentication & authorization
- ✅ Dynamic content management

### Missing Features
- No testing framework configured
- No automated testing (unit, integration, e2e)
- SQLite database (consider PostgreSQL for production)
- Local file storage (consider S3/Cloudflare R2 for production)

### Data Seeding
Initial data includes:
- 1 admin user account
- 8 categories (Home, Portfolio subcategories, Works subcategories)
- 29+ portfolio images from Unsplash
- Complete navigation hierarchy (5 top-level + 8 sub-level items)

To re-seed the database:
```bash
node prisma/seed.js
```

### Environment Variables
Required in `.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

### Image Optimization
- Portfolio images use Unsplash CDN
- Remote patterns configured in `next.config.ts`
- Images use `unoptimized` prop to bypass Next.js optimization
- Local uploads automatically generate WebP thumbnails

## Documentation

- **README.md**: Project overview and quick start guide
- **COMPLETION_REPORT.md**: Detailed completion report with all implemented features
- **PROGRESS_REPORT.md**: Development progress documentation
- **QUICK_START.md**: Quick start guide for new developers
- **TESTING_GUIDE.md**: Manual testing checklist
- **CLAUDE.md**: This file - authoritative source for development guidance

## Site Metadata

- **Title**: "Alens - Photographer"
- **Description**: "Professional photographer specializing in fine art and documentary photography"
- **Metadata**: Configured in `src/app/layout.tsx`

## Key Features

### For Public Users
- Clean, minimal design showcasing photography work
- Auto-rotating image carousel (5-second intervals)
- Manual navigation controls (previous/next, slide indicators)
- Category-based browsing
- Fully responsive (mobile + desktop)

### For Administrators
- Secure login system with role-based access
- Dashboard with real-time statistics
- Navigation management (create, edit, delete, reorder)
- Category management (create, edit, delete)
- Image library management (upload, organize, metadata editing)
- File upload with automatic thumbnail generation
-轮播图设置 (Carousel image configuration)

## Architecture Highlights

1. **Separation of Concerns**: Clear separation between public site and admin dashboard
2. **Type Safety**: Full TypeScript coverage with Prisma type generation
3. **RESTful Design**: Clean API endpoints following REST conventions
4. **Client-Side State Management**: React hooks for managing UI state
5. **Server-Side Data Fetching**: API routes handle database operations
6. **Form Validation**: Zod schemas validate all inputs
7. **Error Handling**: Comprehensive error boundaries and validation
8. **Security**: Password hashing, JWT sessions, route protection, input validation
9. **Performance**: React Compiler optimization, Turbopack builds, API caching strategies
10. **Scalability**: Modular architecture, Prisma ORM, ready for database migration

## Future Enhancements (Optional)

If extending the application:
- Implement testing framework (Jest/Vitest + Testing Library)
- Migrate to PostgreSQL for production
- Add cloud storage (AWS S3/Cloudflare R2)
- Add image tags and search functionality
- Implement SEO optimizations (sitemap, structured data)
- Add blog/news section
- Add client-side caching with React Query/SWR
- Implement real-time features with WebSockets
- Add email notifications
- Multi-language support (i18n)
- Add image watermarking
- Implement progressive web app (PWA) features
