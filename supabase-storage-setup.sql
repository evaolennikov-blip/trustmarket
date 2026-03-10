-- Run in Supabase SQL editor
-- Creates listing-images bucket and RLS policies

INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Auth users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- Allow anyone to view listing images (public bucket)
CREATE POLICY "Public can view listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Allow owners to delete their own images
CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[2]);
