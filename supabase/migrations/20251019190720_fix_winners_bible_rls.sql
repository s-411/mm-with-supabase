-- Fix RLS policies for winners_bible_images
-- Need separate policies for SELECT, INSERT, UPDATE, DELETE

-- Drop the existing catch-all policy
DROP POLICY IF EXISTS "Users can manage own winners bible images" ON winners_bible_images;

-- Create specific policies for each operation
CREATE POLICY "Users can view own winners bible images"
  ON winners_bible_images FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can insert own winners bible images"
  ON winners_bible_images FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can update own winners bible images"
  ON winners_bible_images FOR UPDATE
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));

CREATE POLICY "Users can delete own winners bible images"
  ON winners_bible_images FOR DELETE
  USING (user_id IN (SELECT id FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()));
