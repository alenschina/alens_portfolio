# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is Alen's Portfolio built with Next.js 16, featuring the App Router architecture and React 19. The project uses a minimal, clean structure with Tailwind CSS v4 for styling.

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
# Runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css          # Global styles with Tailwind imports
│   ├── layout.tsx           # Root layout (HTML structure, fonts, metadata)
│   └── page.tsx             # Home page component
├── public/                  # Static assets (SVG files)
```

## Architecture Notes

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Root layout in `src/app/layout.tsx` defines HTML structure, fonts, and metadata
- Home page in `src/app/page.tsx` contains the main portfolio content
- Tailwind CSS v4 uses `@theme inline` for configuration directly in CSS

### React Compiler
- React Compiler is enabled in `next.config.ts` (`reactCompiler: true`)
- Uses `babel-plugin-react-compiler` for automatic optimization
- No special handling needed, but be aware that the compiler may optimize component re-renders

### Path Aliases
- TypeScript configured with path alias: `@/*` maps to `./src/*`
- Can import using `@/components` instead of relative paths

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

- **next.config.ts**: Next.js configuration with React Compiler enabled
- **tsconfig.json**: TypeScript config with strict mode and path aliases
- **eslint.config.mjs**: ESLint configuration for Next.js and TypeScript
- **postcss.config.mjs**: PostCSS config for Tailwind CSS v4
- **src/app/layout.tsx**: Root layout with Geist fonts and metadata
- **src/app/globals.css**: Global styles and Tailwind imports

## Development Notes

- No testing framework configured (Jest, Vitest, or Cypress not installed)
- No database or API routes currently set up
- Static portfolio site with client-side interactivity
- Images in `public/` directory are SVGs used for branding/illustrations
