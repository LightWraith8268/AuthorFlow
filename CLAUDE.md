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
- `src/index.ts` - Main Express server with authentication routes
- `src/types.ts` - Shared TypeScript types (User, Project, Entity, PublishingConnection, etc.)
- `src/routes/` - Modular route handlers (projects.ts implemented)
- `src/middleware/` - Authentication and error handling middleware
  - `auth.ts` - JWT verification middleware with `authenticate` and `optionalAuth`
  - `errorHandler.ts` - Centralized error handling with `ApiError` class

### Routing Structure

**Frontend Routes (React Router):**
- `/` - Landing page
- `/auth` - Authentication (login/signup)
- `/dashboard` - User dashboard
- `/editor/:projectId` - Manuscript editor

**Backend API Routes:**
- `GET /api/health` - Health check endpoint
- **Auth Routes (in src/index.ts):**
  - `POST /api/auth/signup` - User registration (creates Supabase auth + user profile)
  - `POST /api/auth/login` - User login via Supabase (returns session with JWT)
- **Project Routes (in src/routes/projects.ts) - All require authentication:**
  - `GET /api/projects` - Get all projects for authenticated user
  - `GET /api/projects/:id` - Get specific project by ID
  - `POST /api/projects` - Create new project (enforces subscription tier limits)
  - `PATCH /api/projects/:id` - Update project (auto-calculates word_count from content)
  - `DELETE /api/projects/:id` - Delete project (cascading delete via RLS)
  - `POST /api/projects/:id/publish` - Mark project as published

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
1. **Signup** (`POST /api/auth/signup`):
   - Creates Supabase auth user with `signUpWithPassword`
   - Inserts user profile into `users` table with `subscription_tier: 'free'`
   - Returns user object and success message
2. **Login** (`POST /api/auth/login`):
   - Authenticates with Supabase using `signInWithPassword`
   - Returns user object and session (includes JWT access_token)
   - Frontend stores token in localStorage and sets Authorization header
3. **Protected Routes**:
   - Use `authenticate` middleware from `backend/src/middleware/auth.ts`
   - Middleware extracts JWT from `Authorization: Bearer <token>` header
   - Verifies token with `supabase.auth.getUser(token)`
   - Attaches `req.user` object with `{ id, email, role }` for use in route handlers
4. **Token Refresh**:
   - Frontend API client auto-redirects to `/auth` on 401 responses
   - Token stored in localStorage survives page refreshes

**Database Tables (defined in backend/supabase/migrations/001_initial_schema.sql):**
- `users` - User profiles with subscription tiers
- `projects` - Writing projects with content, metadata, and publishing status
- `entities` - Flexible entity system for characters, locations, themes, etc.
- `publishing_connections` - Platform API credentials (one per user per platform)
- `publishing_schedules` - Scheduled publishing to external platforms
- `analytics_snapshots` - Time-series metrics data (JSONB format)

**Important Database Features:**
- All tables have RLS (Row Level Security) enabled
- Automatic `updated_at` triggers on users, projects, and entities
- Cascading deletes configured (e.g., deleting project deletes all entities)
- JSONB columns for flexible metadata storage
- Comprehensive indexes for performance

## Current State & Next Steps

**Implemented:**
- ✅ Basic project structure and build setup
- ✅ Authentication routes (signup/login)
- ✅ Frontend page scaffolding
- ✅ Complete database schema with migrations (`backend/supabase/migrations/001_initial_schema.sql`)
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Authentication middleware with JWT verification (`backend/src/middleware/auth.ts`)
- ✅ Error handling middleware (`backend/src/middleware/errorHandler.ts`)
- ✅ Projects CRUD API endpoints (`backend/src/routes/projects.ts`)
- ✅ Subscription tier limits enforcement (Free: 3 projects, Pro/Plus: unlimited)
- ✅ Frontend API service client with token management (`frontend/src/services/api.ts`)
- ✅ Modular route structure (routes extracted from index.ts)
- ✅ Type definitions for entire data model

**Not Yet Implemented:**
- Entities/worldbuilding CRUD operations (schema ready, routes needed)
- Publishing integrations API (connections and schedules tables ready)
- Analytics tracking and snapshots (table ready, collection logic needed)
- AI features (cover generator, writing assistant)
- Community/beta reader features
- Frontend state management (Zustand installed but not configured)
- Dashboard UI implementation (page exists but minimal)
- Editor UI implementation (page exists but minimal)
- Protected routes on frontend (all routes currently public)

**Architecture Improvements Needed:**
- Add React state management (Zustand store for auth, projects, entities)
- Implement protected route wrapper for frontend
- Add form validation library (React Hook Form + Zod)
- Create reusable UI components (Button, Input, Card, Modal, etc.)
- Add toast notifications for user feedback
- Implement auto-save for editor
- Add real-time collaboration features (Supabase Realtime)

## Backend Development Patterns

### Error Handling
All route handlers should use the `ApiError` class from `backend/src/middleware/errorHandler.ts`:

```typescript
import { ApiError } from '../middleware/errorHandler.js';

// Throw errors with status code and message
throw new ApiError(404, 'Project not found');
throw new ApiError(403, 'Project limit reached for free tier');
throw new ApiError(400, 'Title and type are required');
```

The centralized error handler middleware catches all errors and formats consistent JSON responses.

### Authentication Middleware
Protected routes must use the `authenticate` middleware:

```typescript
import { authenticate } from '../middleware/auth.js';

router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id; // req.user is guaranteed after authenticate
  // ...
});
```

Use `optionalAuth` for routes that work differently for authenticated vs anonymous users.

### Route Structure
New route modules should follow the pattern in `backend/src/routes/projects.ts`:
- Import Router from express
- Import supabase client from `../index.js` (note the .js extension for ESM)
- Import authentication middleware
- Export router as default
- Register in `backend/src/index.ts` with `app.use('/api/resource', resourceRouter)`

### TypeScript ESM Configuration
The backend uses TypeScript with ESM modules:
- All imports must include `.js` extension even for `.ts` files
- `package.json` has `"type": "module"`
- tsconfig.json uses `"module": "NodeNext"`
- Use `import` not `require`

## Frontend Development Patterns

### API Client (frontend/src/services/api.ts)
The frontend uses a singleton API client instance exported as `api`:

```typescript
import { api } from '../services/api';

// Authentication
const response = await api.login(email, password); // Auto-stores token
api.logout(); // Clears token from localStorage

// Projects
const projects = await api.getProjects();
const project = await api.getProject(id);
const newProject = await api.createProject({ title, type });
const updated = await api.updateProject(id, { content: '...' });
await api.deleteProject(id);
await api.publishProject(id);
```

**Key Features:**
- Axios interceptor automatically adds `Authorization: Bearer <token>` header
- Token persisted in localStorage (survives page refresh)
- 401 responses auto-redirect to `/auth` and clear token
- All methods return `ApiResponse<T>` with `{ success, data, error, message }` structure

### State Management
Zustand is installed but not yet configured. When implementing stores:
- Create store in `frontend/src/stores/` directory
- Follow Zustand patterns for TypeScript
- Consider stores for: auth state, current user, projects list, active project

### Route Protection
Currently all routes are public. Implement a `ProtectedRoute` wrapper component that:
- Checks for token in localStorage on mount
- Redirects to `/auth` if no token
- Optionally validates token with backend `/api/health` or similar

## Development Workflow

### First-Time Setup

1. **Apply database migration**
   - Go to Supabase SQL Editor
   - Copy/paste contents of `backend/supabase/migrations/001_initial_schema.sql`
   - Run the migration
   - See `backend/supabase/README.md` for details

2. **Configure environment variables**
   - Backend: `cp backend/.env.example backend/.env`
   - Frontend: `cp frontend/.env.example frontend/.env.local`
   - Fill in Supabase credentials from your Supabase project

3. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Daily Development

1. Start backend first: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Access app at http://localhost:5173
4. Backend runs on http://localhost:3001

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login (save the access_token from session object)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all projects (requires auth token)
curl http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create a project
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Novel","type":"novel","description":"A great story","genre":"Fantasy"}'

# Update a project
curl -X PATCH http://localhost:3001/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"content":"Chapter 1\n\nIt was a dark and stormy night...","status":"in_progress"}'

# Publish a project
curl -X POST http://localhost:3001/api/projects/PROJECT_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Delete a project
curl -X DELETE http://localhost:3001/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Subscription Tiers

- **Free:** 3 projects max, basic editor, 1 platform connection
- **Pro ($9.99/mo):** Unlimited projects, 5 platform connections
- **Plus ($24.99/mo):** Everything in Pro + AI assistant + community features

**Tier Enforcement (backend/src/routes/projects.ts:9-13):**
- Project creation checks `TIER_LIMITS` constant
- Free tier users blocked at 3 projects with 403 error
- Pro/Plus users have `Infinity` project limit
- Limit checked by counting existing projects for user before creation
