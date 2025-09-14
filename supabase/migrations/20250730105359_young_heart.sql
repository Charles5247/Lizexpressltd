/*
  # Production Admin System with Item Approval Workflow

  1. Database Updates
    - Update items table status system for pending/approved workflow
    - Add admin-related fields and functions
    - Create proper approval workflow

  2. Security
    - Update RLS policies for admin approval system
    - Ensure only approved items show in browse
    - Maintain user privacy and security

  3. Notifications
    - Ensure notification system works for approvals
    - Create admin notification triggers
*/

-- Update items table to use proper status system
-- Status values: 'pending' (default), 'active' (approved), 'rejected'
DO $$
BEGIN
  -- Ensure all existing items are set to 'pending' initially for admin review
  UPDATE items SET status = 'pending' WHERE status = 'active';
END $$;

-- Update the default status for new items to 'pending'
ALTER TABLE items ALTER COLUMN status SET DEFAULT 'pending';

-- Add admin approval timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE items ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE items ADD COLUMN approved_by UUID;
  END IF;
END $$;

-- Create admin_actions table for tracking admin activities
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'user' or 'item'
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_actions table
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Admin actions are only viewable by admins (we'll handle this in the app)
CREATE POLICY "Admin actions are private"
  ON admin_actions FOR ALL
  TO authenticated
  USING (false); -- Will be handled by app logic

-- Update RLS policies for items to only show approved items in browse
DROP POLICY IF EXISTS "All authenticated users can view active items" ON items;

-- Create new policy for browse (only approved items)
CREATE POLICY "Users can browse approved items"
  ON items FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Allow users to view their own items regardless of status
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user notification when item is approved/rejected
CREATE OR REPLACE FUNCTION notify_user_on_item_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Item approved
    IF NEW.status = 'active' AND OLD.status = 'pending' THEN
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (
        NEW.user_id,
        'item_approved',
        'Item Approved! 🎉',
        'Great news! Your item "' || NEW.name || '" has been approved and is now live on the platform. Other users can now discover and chat about it.'
      );
      
      -- Update approval timestamp
      NEW.approved_at = now();
      
    -- Item rejected
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (
        NEW.user_id,
        'item_rejected',
        'Item Needs Review 📝',
        'Your item "' || NEW.name || '" needs some adjustments before it can go live. Please review our guidelines and feel free to edit and resubmit.'
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for item status changes
DROP TRIGGER IF EXISTS item_status_change_notification ON items;
CREATE TRIGGER item_status_change_notification
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_item_status_change();

-- Function to create notification when user signs up (for admin tracking)
CREATE OR REPLACE FUNCTION notify_admin_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be handled in the application layer to send admin notifications
  -- We'll track new user registrations in admin dashboard
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better admin dashboard performance
CREATE INDEX IF NOT EXISTS items_status_created_idx ON items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS users_verification_idx ON users(is_verified, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_created_idx ON admin_actions(created_at DESC);

-- Update notification policies to ensure users get their notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a function to safely approve items (will be called from admin interface)
CREATE OR REPLACE FUNCTION approve_item(item_id UUID, admin_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  item_record RECORD;
BEGIN
  -- Get the item
  SELECT * INTO item_record FROM items WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update item to approved
  UPDATE items 
  SET 
    status = 'active',
    approved_at = now(),
    updated_at = now()
  WHERE id = item_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_email, action_type, target_type, target_id, details)
  VALUES (
    admin_email,
    'approve_item',
    'item',
    item_id,
    jsonb_build_object('item_name', item_record.name, 'user_id', item_record.user_id)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely reject items
CREATE OR REPLACE FUNCTION reject_item(item_id UUID, admin_email TEXT, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  item_record RECORD;
BEGIN
  -- Get the item
  SELECT * INTO item_record FROM items WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update item to rejected
  UPDATE items 
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE id = item_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_email, action_type, target_type, target_id, details)
  VALUES (
    admin_email,
    'reject_item',
    'item',
    item_id,
    jsonb_build_object('item_name', item_record.name, 'user_id', item_record.user_id, 'reason', reason)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all users have proper default values
UPDATE users 
SET is_verified = COALESCE(is_verified, false)
WHERE is_verified IS NULL;

-- Update all items to ensure proper status
UPDATE items 
SET status = COALESCE(status, 'pending')
WHERE status IS NULL OR status = '';