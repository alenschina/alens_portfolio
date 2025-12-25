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

- **Framework**: Next.js 16.0.8 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: SQLite + Prisma ORM v6.19.1
- **Auth**: NextAuth.js v4 with JWT sessions
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix UI) + Lucide React
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR
- **Image Processing**: Sharp
- **Tests**: Vitest + @testing-library

## Commands

```bash
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Run production build
npm run lint       # ESLint with auto-fix
npm run format     # Prettier auto-format
npm run format:check  # Check formatting

# Testing
npm run test       # Vitest dev mode with UI
npm run test:run   # Run tests once
npm run test:coverage  # With coverage report

# Database
npx prisma studio  # GUI database editor
npx prisma generate  # Generate Prisma Client
node prisma/seed.js  # Seed initial data
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
│   │   └── images/      # Image library
│   ├── api/             # REST API endpoints
│   │   ├── auth/[...nextauth]/
│   │   ├── navigation/
│   │   ├── categories/
│   │   ├── images/
│   │   └── upload/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Public homepage
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── admin/           # Admin components
│   └── error/           # Error boundary/handler
├── hooks/               # Custom React hooks
│   ├── useApi.ts        # Data fetching hooks
│   ├── useCrud.ts       # CRUD operations
│   └── useFileUpload.ts # File upload handling
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── auth.ts          # NextAuth config
│   └── api-client.ts    # API helpers
└── middleware.ts        # Auth + security headers
```

## Database Schema

**SQLite with Prisma ORM** - 5 models:

1. **User** - Admin accounts with role (ADMIN/SUPER_ADMIN)
2. **Navigation** - Multi-level menu (self-referencing parentId)
3. **Category** - Image categories with slug, coverImage
4. **Image** - Portfolio images with metadata
5. **CategoryImage** - Many-to-many join table (image ↔ category)
6. **Settings** - Key-value store

## Key Architecture

### Authentication
- NextAuth.js credentials provider (email/password)
- JWT sessions with bcryptjs password hashing
- Middleware protection: `/admin/*` requires auth, `/admin/login` is public
- Role-based access: ADMIN, SUPER_ADMIN

### API Design
RESTful endpoints with Zod validation:
- `GET/POST/PUT/DELETE /api/navigation`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/images`
- `GET /api/images/by-category?slug={slug}`
- `POST /api/upload` - Multipart file upload

### Data Fetching
- **SWR** for client-side caching (`useNavigation`, `useImagesByCategory`)
- Custom hooks in `src/hooks/useApi.ts`

### Image Management
- Unsplash CDN for portfolio images
- Local uploads in `public/uploads/`
- Sharp processing: auto-generate WebP thumbnails (400x300)
- Image URLs: `/uploads/{file}` and `/uploads/thumb-{file}`

### Security Headers
Middleware (`src/middleware.ts`) sets CSP, X-Frame-Options, HSTS, Referrer-Policy, etc.

## Default Admin Account
```
Email: admin@alens.com
Password: admin123
```

## Path Aliases
`@/*` maps to `./src/*`

## Environment Variables (.env)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```
