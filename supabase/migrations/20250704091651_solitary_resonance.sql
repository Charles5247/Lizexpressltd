/*
  # Verification System Setup

  1. New Tables
    - verifications
      - Stores user verification documents and status
      - Links to users table
      - Tracks verification progress

  2. Storage Buckets
    - verification bucket for storing verification documents

  3. Security
    - Enable RLS on verifications table
    - Policies for users to manage their own verification
    - Storage policies for verification documents
*/

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  identity_document TEXT,
  address_document TEXT,
  selfie_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add verification_submitted column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'verification_submitted'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_submitted BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Enable RLS on verifications table
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Verifications policies
CREATE POLICY "Users can view their own verification"
  ON verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification"
  ON verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification"
  ON verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create verification storage bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('verification', 'verification', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for verification bucket
CREATE POLICY "Users can upload their verification documents" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'verification' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their verification documents" 
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'verification' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their verification documents" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'verification' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their verification documents" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'verification' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS verifications_user_id_idx ON verifications(user_id);
CREATE INDEX IF NOT EXISTS verifications_status_idx ON verifications(status);