-- =============================================
-- NIRVANA MILESTONES TABLE
-- =============================================
CREATE TABLE nirvana_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('handstand', 'flexibility', 'strength', 'balance')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMPTZ,
  target_value DECIMAL(10,2),
  unit TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for nirvana_milestones
ALTER TABLE nirvana_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nirvana milestones"
  ON nirvana_milestones FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_nirvana_milestones_user ON nirvana_milestones(user_id);
CREATE INDEX idx_nirvana_milestones_category ON nirvana_milestones(user_id, category, order_index);

-- =============================================
-- NIRVANA PERSONAL RECORDS TABLE
-- =============================================
CREATE TABLE nirvana_personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('handstand', 'flexibility', 'strength', 'balance')),
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  record_date TIMESTAMPTZ DEFAULT NOW(),
  previous_value DECIMAL(10,2),
  previous_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- RLS policies for nirvana_personal_records
ALTER TABLE nirvana_personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personal records"
  ON nirvana_personal_records FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_nirvana_personal_records_user ON nirvana_personal_records(user_id);
CREATE INDEX idx_nirvana_personal_records_category ON nirvana_personal_records(user_id, category);

-- =============================================
-- BODY PART MAPPINGS TABLE
-- =============================================
CREATE TABLE body_part_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  body_parts JSONB DEFAULT '[]'::jsonb,
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_type)
);

-- RLS policies for body_part_mappings
ALTER TABLE body_part_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own body part mappings"
  ON body_part_mappings FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_body_part_mappings_user ON body_part_mappings(user_id);
