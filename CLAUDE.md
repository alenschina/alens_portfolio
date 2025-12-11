# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is Alen Smith's Photography Portfolio built with Next.js 16, featuring a minimal, clean design that showcases photographic work through an auto-rotating image carousel. The site uses App Router architecture with React 19 and Tailwind CSS v4 for styling.

## Tech Stack

- **Framework**: Next.js 16.0.8 with App Router
- **Language**: TypeScript
- **UI Library**: React 19.2.1
- **Styling**: Tailwind CSS v4 (using `@import "tailwindcss"` in globals.css)
- **Compiler**: React Compiler enabled (babel-plugin-react-compiler)
- **Fonts**: Geist and Geist_Mono (via next/font)
- **Linting**: ESLint with Next.js recommended configs

## Common Development Commands

```bash
# Start development server
npm run dev
# Opens http://localhost:3000 with hot reload

# Build for production
npm run build
# Creates optimized production build in .next/

# Start production server
npm run start
# Runs production build (requires build first)

# Run linter
npm run lint
# ESLint checks using Next.js TypeScript configs
```

**Note:** No test scripts configured (no Jest, Vitest, or Cypress installed)

## Project Structure

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css          # Global styles with Tailwind imports
│   ├── layout.tsx           # Root layout (HTML structure, fonts, metadata)
│   └── page.tsx             # Home page component (client-side, interactive carousel)
├── public/                  # Static SVG assets (icons and illustrations)
```

**Notable absence:**
- No separate component files (all UI in page.tsx)
- No additional routes/pages (single-page application)
- No API routes or database integration

## Architecture Notes

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Root layout in `src/app/layout.tsx` defines HTML structure, fonts, and metadata
- Home page in `src/app/page.tsx` contains the main portfolio content
- Tailwind CSS v4 uses `@theme inline` for configuration directly in CSS

### Client-Side Interactivity
- Home page (`src/app/page.tsx`) is a client component with `"use client"` directive
- Implements image carousel with auto-rotation (5-second intervals)
- Uses React hooks: `useState` and `useEffect`
- Navigation controls for manual slideshow browsing

### Responsive Design
- Mobile: Single-column layout with top header navigation
- Desktop: Two-column layout with fixed sidebar (30%) + main content (70%)
- Image carousel: Auto-rotating slideshow with manual navigation controls
- Breakpoint: `lg` (1024px) switches from mobile to desktop layout

### React Compiler
- React Compiler is enabled in `next.config.ts` (`reactCompiler: true`)
- Uses `babel-plugin-react-compiler` for automatic optimization
- No special handling needed, but be aware that the compiler may optimize component re-renders

### Path Aliases
- TypeScript configured with path alias: `@/*` maps to `./src/*`
- Can import using `@/components` instead of relative paths

### Image Configuration
- Images are served from Unsplash (images.unsplash.com)
- Remote patterns configured in next.config.ts for optimization
- Images use `unoptimized` prop to bypass Next.js optimization pipeline
- Formats: AVIF and WebP supported with fallback

### Styling
- Tailwind CSS v4 (latest version)
- Uses `@import "tailwindcss"` syntax in `globals.css`
- Custom CSS variables for theme colors defined in `:root`
- Dark mode support via `prefers-color-scheme` media query

### ESLint Configuration
- Uses `eslint-config-next` with TypeScript support
- Includes Next.js core web vitals rules
- Ignores `.next/`, `out/`, `build/` directories

## Important Files

- **next.config.ts**:
  - React Compiler enabled (`reactCompiler: true`)
  - Image optimization: AVIF/WebP formats, responsive sizes
  - Remote patterns: images.unsplash.com configured
- **tsconfig.json**: TypeScript config with strict mode and path aliases
- **eslint.config.mjs**: ESLint configuration for Next.js and TypeScript
- **postcss.config.mjs**: PostCSS config for Tailwind CSS v4
- **src/app/layout.tsx**: Root layout with Geist fonts and metadata
- **src/app/globals.css**: Global styles and Tailwind imports
- **src/app/page.tsx**: Client-side homepage with image carousel implementation

## Documentation Notes

- **README.md**: Generic create-next-app template - not customized for this project
- **CLAUDE.md**: This file is the authoritative source for development guidance

## Development Notes

- No testing framework configured (Jest, Vitest, or Cypress not installed)
- No database or API routes currently set up
- Static portfolio site with client-side interactivity
- Images in `public/` directory are SVGs used for branding/illustrations
- Portfolio images loaded from Unsplash CDN
- Site metadata: "Alen Smith - Photographer" specializing in fine art and documentary photography
