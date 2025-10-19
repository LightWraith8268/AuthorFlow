-- AuthorFlow Database Schema
-- This migration creates all necessary tables for the AuthorFlow platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'plus')),
  subscription_renewal TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('novel', 'short_story', 'essay_collection', 'non_fiction', 'series_universe', 'poetry', 'blog')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'published', 'archived')),

  -- Content
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  genre TEXT,
  target_audience TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Publishing
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entities table (characters, locations, themes, etc.)
CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('character', 'location', 'theme', 'plot_point', 'chapter', 'scene', 'reference')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',

  -- Flexible metadata stored as JSONB
  metadata JSONB DEFAULT '{}',

  -- For characters
  role TEXT CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'minor', NULL)),

  -- For locations (simple coordinates)
  coordinate_x NUMERIC,
  coordinate_y NUMERIC,

  -- Timeline
  timeline_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Publishing connections table
CREATE TABLE IF NOT EXISTS public.publishing_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('amazon_kdp', 'substack', 'medium', 'personal_blog', 'newsletter')),
  api_key TEXT,
  api_secret TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Ensure one connection per platform per user
  UNIQUE(user_id, platform)
);

-- Publishing schedule table
CREATE TABLE IF NOT EXISTS public.publishing_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics snapshots table
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,

  -- Metrics stored as JSONB for flexibility
  metrics JSONB NOT NULL DEFAULT '{"reads": 0, "engagement_rate": 0, "revenue": 0, "comments": 0, "shares": 0}',

  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);
CREATE INDEX IF NOT EXISTS idx_entities_project_id ON public.entities(project_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.entities(type);
CREATE INDEX IF NOT EXISTS idx_publishing_connections_user_id ON public.publishing_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_schedules_project_id ON public.publishing_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_project_id ON public.analytics_snapshots(project_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Entities policies
CREATE POLICY "Users can view entities in own projects" ON public.entities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = entities.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert entities in own projects" ON public.entities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = entities.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entities in own projects" ON public.entities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = entities.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entities in own projects" ON public.entities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = entities.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Publishing connections policies
CREATE POLICY "Users can view own publishing connections" ON public.publishing_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publishing connections" ON public.publishing_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own publishing connections" ON public.publishing_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own publishing connections" ON public.publishing_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Publishing schedules policies
CREATE POLICY "Users can view schedules for own projects" ON public.publishing_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = publishing_schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for own projects" ON public.publishing_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = publishing_schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedules for own projects" ON public.publishing_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = publishing_schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules for own projects" ON public.publishing_schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = publishing_schedules.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Analytics snapshots policies
CREATE POLICY "Users can view analytics for own projects" ON public.analytics_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analytics_snapshots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
