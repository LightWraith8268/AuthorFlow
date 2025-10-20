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

### ✅ Completed (Latest: 2025-10-19)

**Build & Infrastructure:**
- ✅ TypeScript compilation working (backend + frontend)
- ✅ Tailwind CSS v4 configured with PostCSS
- ✅ Backend compiles without errors
- ✅ Frontend builds successfully (243 KB bundle)
- ✅ Both dev servers start correctly

**Database & Backend:**
- ✅ Supabase project configured (https://visvcsddzmnqlkkfyoww.supabase.co)
- ✅ Database migration applied successfully
- ✅ All tables created with RLS policies:
  - `users` - User profiles with subscription tiers
  - `projects` - Writing projects with content tracking
  - `entities` - Character/worldbuilding system
  - `publishing_connections` - Platform integrations
  - `publishing_schedules` - Scheduled publishing
  - `analytics_snapshots` - Metrics tracking
- ✅ Authentication routes (signup/login) implemented
- ✅ Projects CRUD API endpoints working
- ✅ Subscription tier enforcement (Free: 3 projects, Pro/Plus: unlimited)
- ✅ JWT authentication middleware
- ✅ Error handling middleware with ApiError class
- ✅ Automatic word count calculation on content updates
- ✅ Environment files configured (backend/.env, frontend/.env.local)

**Frontend Foundation:**
- ✅ Page scaffolding (Landing, Auth, Dashboard, Editor)
- ✅ API client service with token management
- ✅ Axios interceptors for auth headers
- ✅ Auto-redirect on 401 responses
- ✅ React Router setup
- ✅ Tailwind utility classes and custom components

**Testing:**
- ✅ Backend server running on http://localhost:3001
- ✅ Health endpoint verified
- ✅ Signup endpoint tested and working
- ✅ Test scripts created (test-simple.ps1)

### ⚠️ Known Issues

1. **Supabase Email Confirmation** - Login requires email confirmation by default
   - **Fix:** Disable in Supabase Dashboard → Authentication → Email Confirmations → OFF
   - Alternative: Use admin API to manually confirm test users

2. **Frontend Not Connected** - Frontend pages don't call API yet
   - Auth page needs to integrate with api.signup()/api.login()
   - Dashboard needs to fetch projects on load

### 🔧 In Progress / Next Steps (Priority Order)

**Phase 1: Core Auth Flow (HIGH PRIORITY)**
1. **Disable Supabase email confirmation** for development
2. **Implement Zustand auth store** (`frontend/src/stores/authStore.ts`)
   - Track: user, token, isAuthenticated, isLoading
   - Actions: login, logout, signup, checkAuth
3. **Create ProtectedRoute wrapper** component
   - Check auth state from store
   - Redirect to /auth if not authenticated
4. **Wire up AuthPage** to API
   - Connect login/signup forms to api client
   - Store token in auth store
   - Redirect to dashboard on success

**Phase 2: Dashboard & Projects (HIGH PRIORITY)**
5. **Implement projects store** (`frontend/src/stores/projectsStore.ts`)
   - Track: projects list, current project, loading states
   - Actions: fetchProjects, createProject, updateProject, deleteProject
6. **Build Dashboard UI**
   - Project cards grid with thumbnails
   - "New Project" modal with form
   - Word count, status badges
   - Delete confirmation modal
7. **Add toast notifications** (react-hot-toast or similar)
   - Success/error feedback for all actions

**Phase 3: Editor & Writing (MEDIUM PRIORITY)**
8. **Implement Editor page**
   - Rich text editor or markdown editor
   - Auto-save every 30 seconds
   - Word count display
   - Character/entity panel (sidebar)
9. **Add form validation**
   - React Hook Form + Zod
   - Validation for project creation/editing

**Phase 4: Advanced Features (LOWER PRIORITY)**
10. **Entities/worldbuilding CRUD** - API routes needed
11. **Publishing integrations** - API implementation
12. **Analytics tracking** - Data collection logic
13. **AI features** - Cover generator, writing assistant
14. **Real-time collaboration** - Supabase Realtime integration

### 🚀 Quick Start for Next Developer

```bash
# 1. Install dependencies (if not done)
cd backend && npm install
cd ../frontend && npm install

# 2. Start both servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 3. Access the app
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001/api

# 4. Test signup (use real-looking email)
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"Password123!","username":"testuser"}'
```

### 📁 Key Files to Know

**Backend:**
- `backend/src/index.ts` - Main server, auth routes
- `backend/src/routes/projects.ts` - Projects CRUD
- `backend/src/middleware/auth.ts` - JWT verification
- `backend/src/middleware/errorHandler.ts` - Error handling
- `backend/src/types.ts` - TypeScript type definitions

**Frontend:**
- `frontend/src/services/api.ts` - API client singleton
- `frontend/src/pages/` - Page components
- `frontend/src/types.ts` - Frontend types (mirrors backend)
- `frontend/src/index.css` - Tailwind CSS + custom styles

**Database:**
- `backend/supabase/migrations/001_initial_schema.sql` - Full DB schema
- Supabase Dashboard: https://supabase.com/dashboard/project/visvcsddzmnqlkkfyoww

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
