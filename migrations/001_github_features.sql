-- Migration: Add GitHub-like features (stars, forks, activity, tags)
-- Run this against your PostgreSQL database

-- ─── Add new columns to scripts ──────────────────────────
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS star_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS fork_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS forked_from_id UUID;
CREATE INDEX IF NOT EXISTS idx_scripts_star_count ON scripts (star_count);
CREATE INDEX IF NOT EXISTS idx_scripts_forked_from ON scripts (forked_from_id);

-- ─── Stars ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stars_user_script ON stars (user_id, script_id);
CREATE INDEX IF NOT EXISTS idx_stars_script ON stars (script_id);
CREATE INDEX IF NOT EXISTS idx_stars_user ON stars (user_id);

-- ─── Forks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  forked_script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  forked_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forks_source ON forks (source_script_id);
CREATE INDEX IF NOT EXISTS idx_forks_forked_by ON forks (forked_by_id);

-- ─── Activity Events ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  script_id UUID,
  target_user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity (created_at);
CREATE INDEX IF NOT EXISTS idx_activity_script ON activity (script_id);

-- ─── Tags ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags (slug);

CREATE TABLE IF NOT EXISTS script_tags (
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_script_tags_pk ON script_tags (script_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_script_tags_tag ON script_tags (tag_id);
