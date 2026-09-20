-- Create a public storage bucket for counsellor avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'counsellor-avatars',
  'counsellor-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Counsellors can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'counsellor-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/replace their own avatar
CREATE POLICY "Counsellors can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'counsellor-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Counsellors can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'counsellor-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (since bucket is public)
CREATE POLICY "Public can view counsellor avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'counsellor-avatars');
