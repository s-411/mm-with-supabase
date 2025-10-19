-- Add missing settings tables for user configuration
-- Migration: 20250119000001_add_settings_tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- COMPOUNDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS compounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- RLS policies for compounds
ALTER TABLE compounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own compounds"
  ON compounds FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compounds_user ON compounds(user_id, order_index);

-- =============================================
-- FOOD TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS food_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  protein DECIMAL(8,2) DEFAULT 0,
  fat DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for food_templates
ALTER TABLE food_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own food templates"
  ON food_templates FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_templates_user ON food_templates(user_id);

-- =============================================
-- NIRVANA SESSION TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS nirvana_session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- RLS policies for nirvana_session_types
ALTER TABLE nirvana_session_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nirvana session types"
  ON nirvana_session_types FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nirvana_session_types_user ON nirvana_session_types(user_id, order_index);

-- =============================================
-- ADD TIMEZONE TO USER PROFILES
-- =============================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- =============================================
-- ADD DEFAULT DATA FUNCTIONS
-- =============================================

-- Function to seed default compounds for a new user
CREATE OR REPLACE FUNCTION seed_default_compounds(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  INSERT INTO compounds (user_id, name, order_index)
  VALUES
    (p_user_id, 'Ipamorellin', 0),
    (p_user_id, 'Retatrutide', 1),
    (p_user_id, 'Testosterone', 2)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to seed default nirvana session types for a new user
CREATE OR REPLACE FUNCTION seed_default_session_types(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  INSERT INTO nirvana_session_types (user_id, name, order_index)
  VALUES
    (p_user_id, 'Cardio', 0),
    (p_user_id, 'Strength Training', 1),
    (p_user_id, 'Yoga', 2),
    (p_user_id, 'Stretching', 3)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
