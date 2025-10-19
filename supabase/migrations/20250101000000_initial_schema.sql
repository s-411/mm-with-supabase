-- MM Health Tracker: Initial Schema with Clerk Integration
-- This migration creates all core tables with RLS policies for per-user isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function to get Clerk user ID from JWT
-- Note: Using public schema instead of auth (which is restricted)
CREATE OR REPLACE FUNCTION public.clerk_user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  bmr INTEGER NOT NULL DEFAULT 2000,
  height DECIMAL(5,2), -- cm
  weight DECIMAL(5,2), -- kg
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  tracker_settings JSONB DEFAULT '{}',
  macro_targets JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (clerk_user_id = public.clerk_user_id());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (clerk_user_id = public.clerk_user_id());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (clerk_user_id = public.clerk_user_id());

-- Index for performance
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- =============================================
-- DAILY ENTRIES TABLE
-- =============================================
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2), -- Optional daily weight
  deep_work_completed BOOLEAN DEFAULT FALSE,
  winners_bible_morning BOOLEAN DEFAULT FALSE,
  winners_bible_night BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS policies for daily_entries
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can insert own daily entries"
  ON daily_entries FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can update own daily entries"
  ON daily_entries FOR UPDATE
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can delete own daily entries"
  ON daily_entries FOR DELETE
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes for performance
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, date DESC);
CREATE INDEX idx_daily_entries_date ON daily_entries(date DESC);

-- =============================================
-- CALORIE ENTRIES TABLE
-- =============================================
CREATE TABLE calorie_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  daily_entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  food_name TEXT NOT NULL,
  calories DECIMAL(8,2),
  carbs DECIMAL(8,2),
  protein DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  sugar DECIMAL(8,2),
  sodium DECIMAL(8,2),
  quantity DECIMAL(8,2),
  unit TEXT,
  meal_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for calorie_entries
ALTER TABLE calorie_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calorie entries"
  ON calorie_entries FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_calorie_entries_user_date ON calorie_entries(user_id, date DESC);

-- =============================================
-- EXERCISE ENTRIES TABLE
-- =============================================
CREATE TABLE exercise_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  daily_entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned DECIMAL(8,2),
  intensity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for exercise_entries
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise entries"
  ON exercise_entries FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_exercise_entries_user_date ON exercise_entries(user_id, date DESC);

-- =============================================
-- INJECTION ENTRIES TABLE
-- =============================================
CREATE TABLE injection_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_of_day TEXT,
  compound_name TEXT NOT NULL,
  dosage DECIMAL(8,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'mg',
  injection_site TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for injection_entries
ALTER TABLE injection_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own injection entries"
  ON injection_entries FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_injection_entries_user_date ON injection_entries(user_id, date DESC);

-- =============================================
-- INJECTION TARGETS TABLE
-- =============================================
CREATE TABLE injection_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  compound_name TEXT NOT NULL,
  target_dosage DECIMAL(8,2) NOT NULL,
  frequency_per_week INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'mg',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, compound_name)
);

-- RLS policies for injection_targets
ALTER TABLE injection_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own injection targets"
  ON injection_targets FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- =============================================
-- MIT (Most Important Tasks) TABLE
-- =============================================
CREATE TABLE mits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  daily_entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- Date these MITs are planned for
  task_description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for mits
ALTER TABLE mits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mits"
  ON mits FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_mits_user_date ON mits(user_id, date DESC);

-- =============================================
-- WEEKLY ENTRIES TABLE
-- =============================================
CREATE TABLE weekly_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday's date
  objectives JSONB DEFAULT '[]',
  why_important TEXT,
  friday_review TEXT,
  review_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- RLS policies for weekly_entries
ALTER TABLE weekly_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weekly entries"
  ON weekly_entries FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_weekly_entries_user_week ON weekly_entries(user_id, week_start DESC);

-- =============================================
-- NIRVANA ENTRIES TABLE
-- =============================================
CREATE TABLE nirvana_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS policies for nirvana_entries
ALTER TABLE nirvana_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nirvana entries"
  ON nirvana_entries FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_nirvana_entries_user_date ON nirvana_entries(user_id, date DESC);

-- =============================================
-- NIRVANA SESSIONS TABLE
-- =============================================
CREATE TABLE nirvana_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  nirvana_entry_id UUID NOT NULL REFERENCES nirvana_entries(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  session_number INTEGER DEFAULT 1,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for nirvana_sessions
ALTER TABLE nirvana_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nirvana sessions"
  ON nirvana_sessions FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_nirvana_sessions_entry ON nirvana_sessions(nirvana_entry_id);

-- =============================================
-- CUSTOM METRICS TABLE
-- =============================================
CREATE TABLE custom_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_unit TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for custom_metrics
ALTER TABLE custom_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom metrics"
  ON custom_metrics FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_custom_metrics_user_date ON custom_metrics(user_id, date DESC);

-- =============================================
-- WINNERS BIBLE IMAGES TABLE (for storage references)
-- =============================================
CREATE TABLE winners_bible_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Supabase storage path
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for winners_bible_images
ALTER TABLE winners_bible_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own winners bible images"
  ON winners_bible_images FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_entries_updated_at BEFORE UPDATE ON weekly_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nirvana_entries_updated_at BEFORE UPDATE ON nirvana_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_injection_targets_updated_at BEFORE UPDATE ON injection_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
