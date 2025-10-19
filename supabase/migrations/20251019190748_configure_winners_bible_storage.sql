-- Configure Supabase Storage bucket and policies for winners-bible

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('winners-bible', 'winners-bible', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: Allow users to upload, view, and delete their own images

-- Policy for uploading (INSERT)
CREATE POLICY "Users can upload their own winners bible images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'winners-bible' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()
    )
  );

-- Policy for viewing (SELECT) - allow public access since bucket is public
CREATE POLICY "Anyone can view winners bible images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'winners-bible');

-- Policy for updating
CREATE POLICY "Users can update their own winners bible images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'winners-bible' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()
    )
  );

-- Policy for deleting (DELETE)
CREATE POLICY "Users can delete their own winners bible images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'winners-bible' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM user_profiles WHERE clerk_user_id = public.clerk_user_id()
    )
  );
