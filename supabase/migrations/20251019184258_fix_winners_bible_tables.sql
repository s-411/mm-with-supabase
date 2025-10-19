-- Fix UUID generation function for winners_bible_images
-- Change from uuid_generate_v4() to gen_random_uuid()

-- Drop existing table and recreate with correct UUID function
DROP TABLE IF EXISTS winners_bible_images CASCADE;

CREATE TABLE winners_bible_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase storage path: winners-bible/{user_id}/{filename}
  mime_type TEXT NOT NULL, -- image/jpeg, image/png, etc.
  size_bytes INTEGER NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for winners_bible_images
ALTER TABLE winners_bible_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own winners bible images"
  ON winners_bible_images FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

-- Indexes
CREATE INDEX idx_winners_bible_images_user ON winners_bible_images(user_id);
CREATE INDEX idx_winners_bible_images_user_order ON winners_bible_images(user_id, display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_winners_bible_images_updated_at
  BEFORE UPDATE ON winners_bible_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
