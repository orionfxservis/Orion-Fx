-- ==============================================================================
-- ORION FX / MYBEATBOX SUPABASE SQL SCHEMA (FAIL-SAFE MIGRATION)
-- Target Database: Shared Supabase Project (e.g., Qanooni Mushawarat & Orion FX)
-- Isolation Strategy: Project Tagging ('mybeatbox') & Dedicated App Tables
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Orion FX Projects Table (Auto-create or Alter Existing Table)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist even if 'projects' was created previously
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completion_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completed';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure unique constraint or index on project_name for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_project_name_unique'
  ) THEN
    -- Check if project_name has a unique constraint or create unique index
    BEGIN
      ALTER TABLE public.projects ADD CONSTRAINT projects_project_name_unique UNIQUE (project_name);
    EXCEPTION
      WHEN others THEN
        -- If duplicate or cannot add constraint directly, create unique index
        CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_name ON public.projects(project_name);
    END;
  END IF;
END $$;

-- Insert or Update MyBeatBox Mobile Application in Orion FX Showcase
INSERT INTO public.projects (
  project_name,
  client_name,
  category,
  description,
  technologies,
  project_url,
  github_url,
  featured_image,
  status,
  featured
) VALUES (
  'MyBeatBox Studio',
  'Orion FX',
  'Mobile Application',
  'Acoustic mobile audio workstation featuring real-time 7-band parametric EQ, personalized playlists, AI recommendations, and offline caching.',
  '["React 18", "TypeScript", "Tailwind CSS", "Web Audio API", "Supabase"]'::jsonb,
  'https://www.orionfx.net/mobile-apps/MyBeatBox/',
  'https://github.com/orionfx/mobile-apps/tree/main/MyBeatBox',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'Completed',
  true
)
ON CONFLICT (project_name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  technologies = EXCLUDED.technologies,
  project_url = EXCLUDED.project_url,
  github_url = EXCLUDED.github_url,
  featured_image = EXCLUDED.featured_image,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. MyBeatBox User & Playlist Data (Isolated by project_name: 'mybeatbox')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mybeatbox_user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL DEFAULT 'mybeatbox', -- Isolates from Qanooni Mushawarat & other apps
  user_name TEXT DEFAULT 'Faisal',
  email TEXT,
  avatar_url TEXT,
  theme_id TEXT DEFAULT 'studio-midnight',
  playlists JSONB DEFAULT '[]'::jsonb,
  favorite_songs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_per_project UNIQUE (user_id, project_name)
);

-- Index for fast queries by project and user
CREATE INDEX IF NOT EXISTS idx_mybeatbox_user_project 
ON public.mybeatbox_user_data(user_id, project_name);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mybeatbox_user_data ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Projects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow public all on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- mybeatbox_user_data policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on mybeatbox_user_data' AND tablename = 'mybeatbox_user_data') THEN
    CREATE POLICY "Allow public access on mybeatbox_user_data" ON public.mybeatbox_user_data FOR ALL 
    USING (project_name = 'mybeatbox')
    WITH CHECK (project_name = 'mybeatbox');
  END IF;
END $$;
