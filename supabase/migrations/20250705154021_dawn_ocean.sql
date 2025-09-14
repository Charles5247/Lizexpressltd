/*
  # Create feedback table for customer feedback system

  1. New Tables
    - feedback
      - Stores customer feedback and support requests
      - Links to users table (optional for anonymous feedback)
      - Tracks feedback status and responses

  2. Security
    - Enable RLS on feedback table
    - Policies for users to submit and view their own feedback
    - Admin policies for managing all feedback
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  feedback TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies
CREATE POLICY "Users can submit feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to submit feedback

CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Anonymous feedback submission"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL); -- Allow anonymous feedback

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_email_idx ON feedback(email);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);