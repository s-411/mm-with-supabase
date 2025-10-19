-- Fix Winners Bible storage bucket and RLS policies for Supabase Auth
-- The previous migration used Clerk functions which no longer exist after migration to Supabase Auth

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can upload their own winners bible images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view winners bible images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own winners bible images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own winners bible images" ON storage.objects;

-- Create the correct bucket for winners-bible-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'winners-bible-images',
  'winners-bible-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Policy for uploading (INSERT) - use Supabase Auth
CREATE POLICY "Authenticated users can upload winners bible images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'winners-bible-images' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Policy for viewing (SELECT) - allow public access since bucket is public
CREATE POLICY "Public can view winners bible images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'winners-bible-images');

-- Policy for updating - authenticated users can update their own images
CREATE POLICY "Authenticated users can update their own winners bible images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'winners-bible-images' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Policy for deleting (DELETE) - authenticated users can delete their own images
CREATE POLICY "Authenticated users can delete their own winners bible images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'winners-bible-images' AND
    (storage.foldername(name))[1] = (auth.uid())::text
  );
