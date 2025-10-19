# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuthorFlow is an all-in-one platform for writers to write, publish, and monetize their work. It supports multiple project types (novels, essays, short stories, non-fiction, poetry, blogs) with features for character/worldbuilding, publishing to multiple platforms, analytics tracking, and AI-assisted writing.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth
- State Management: Zustand

## Development Commands

### Backend (from `backend/` directory)
```bash
npm run dev          # Start development server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled server from dist/
npm run type-check   # Type-check without emitting files
```

### Frontend (from `frontend/` directory)
```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript compilation + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Environment Setup

Both frontend and backend require environment variables. Copy the example files:

**Backend:** `cp backend/.env.example backend/.env`
- Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `PORT` (default: 3001), `CORS_ORIGIN` (default: http://localhost:5173)
- Backend will exit immediately if Supabase credentials are missing

**Frontend:** `cp frontend/.env.example frontend/.env.local`
- Required: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Architecture

### Monorepo Structure

The project is a monorepo with separate frontend and backend directories. They are independent Node.js projects with their own `package.json` files.

**Frontend (React SPA):**
- `src/pages/` - Full page components (LandingPage, AuthPage, DashboardPage, EditorPage)
- `src/components/` - Reusable UI components (currently minimal)
- `src/hooks/` - Custom React hooks
- `src/services/` - API client services
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

**Backend (Express API):**
- `src/index.ts` - Main Express server with all routes (currently monolithic)
- `src/types.ts` - Shared TypeScript types (User, Project, Entity, PublishingConnection, etc.)
- Routes are currently inline in `index.ts` - will need extraction to `routes/` directory
- Business logic is inline - will need extraction to `services/` directory

### Routing Structure

**Frontend Routes (React Router):**
- `/` - Landing page
- `/auth` - Authentication (login/signup)
- `/dashboard` - User dashboard
- `/editor/:projectId` - Manuscript editor

**Backend API Routes:**
- `GET /api/health` - Health check endpoint
- `POST /api/auth/signup` - User registration (creates Supabase auth + user profile)
- `POST /api/auth/login` - User login via Supabase
- `GET /api/projects` - Placeholder (returns empty array)
- `POST /api/projects` - Placeholder

### Data Model (from backend/src/types.ts)

**Core Entities:**
- `User` - User accounts with subscription tiers (free/pro/plus)
- `Project` - Writing projects with flexible `ProjectType` (novel, short_story, essay_collection, non_fiction, series_universe, poetry, blog)
- `Entity` - Flexible entity system for characters, locations, themes, plot points, chapters, scenes, references
- `PublishingConnection` - Platform integrations (Amazon KDP, Substack, Medium, personal blog, newsletter)
- `PublishingSchedule` - Scheduled publishing across platforms
- `AnalyticsSnapshot` - Metrics tracking (reads, engagement, revenue, comments, shares)

**Key Design Patterns:**
- Entities use flexible `metadata: Record<string, any>` for type-specific data
- All timestamps use `Date` type
- Subscription tiers control feature access (max_projects, max_platforms, AI features)

### Supabase Integration

The backend creates a Supabase client instance exported from `backend/src/index.ts`:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Authentication Flow:**
1. Signup creates Supabase auth user, then inserts profile into `users` table
2. Login uses Supabase `signInWithPassword`
3. Session tokens returned to frontend

**Database Tables (inferred):**
- `users` - User profiles (id, email, username, subscription_tier, created_at)
- Additional tables for projects, entities, etc. need to be created in Supabase

## Current State & Next Steps

**Implemented:**
- Basic project structure and build setup
- Authentication routes (signup/login)
- Frontend page scaffolding
- Type definitions for entire data model

**Not Yet Implemented:**
- Projects CRUD operations (routes are placeholders)
- Entities/worldbuilding system
- Publishing integrations
- Analytics tracking
- AI features
- Community/beta reader features
- Actual database schema in Supabase (only users table mentioned in code)

**Architecture Debt:**
- Backend routes should be extracted from `index.ts` to `backend/src/routes/`
- Business logic should be extracted to `backend/src/services/`
- No error middleware properly configured (placeholder exists but not used)
- No authentication middleware for protected routes

## Development Workflow

1. Start backend first: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Access app at http://localhost:5173
4. Backend runs on http://localhost:3001

## Subscription Tiers

- **Free:** 3 projects, basic editor, 1 platform connection
- **Pro ($9.99/mo):** Unlimited projects, 5 platform connections
- **Plus ($24.99/mo):** Everything in Pro + AI assistant + community features
