/*
# Fix Item Browsing - Show All Users' Items

## Issues Fixed
- Update RLS policies to ensure all active items are visible to all users
- Fix user profile visibility for item listings
- Ensure proper joins work for item browsing
- Add policies for viewing other users' basic info

## Changes
1. Update items table policies to allow viewing all active items
2. Add policy for users to view basic info of other users (for item listings)
3. Fix any missing user profiles issue
4. Ensure proper indexing for performance
*/

-- Drop existing items policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
DROP POLICY IF EXISTS "Users can create items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;

-- Create comprehensive items policies
CREATE POLICY "All authenticated users can view active items"
ON items FOR SELECT
TO authenticated
USING (status = 'active');

CREATE POLICY "Users can create their own items"
ON items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add policy for users to view basic info of other users (needed for item listings)
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can upsert their own profile" ON users;

-- Users can read basic info of all users (for item listings)
CREATE POLICY "Users can read basic profile info"
ON users FOR SELECT
TO authenticated
USING (true); -- Allow reading basic profile info for all users

-- Users can only create/update their own profile
CREATE POLICY "Users can create their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Function to ensure user profile exists when viewing items
CREATE OR REPLACE FUNCTION ensure_user_exists_for_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile if it doesn't exist when user signs in
  INSERT INTO users (id, created_at, updated_at)
  VALUES (auth.uid(), now(), now())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for items with user info (optional, for better performance)
CREATE OR REPLACE VIEW items_with_users AS
SELECT 
  i.*,
  u.full_name,
  u.avatar_url
FROM items i
LEFT JOIN users u ON i.user_id = u.id
WHERE i.status = 'active';

-- Ensure all existing items have corresponding user profiles
DO $$
DECLARE
    item_record RECORD;
BEGIN
    FOR item_record IN 
        SELECT DISTINCT user_id 
        FROM items 
        WHERE user_id NOT IN (SELECT id FROM users)
    LOOP
        INSERT INTO users (id, created_at, updated_at)
        VALUES (item_record.user_id, now(), now())
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS items_status_created_idx ON items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS items_category_status_idx ON items(category, status);
CREATE INDEX IF NOT EXISTS items_user_status_idx ON items(user_id, status);

-- Add a function to get items with user info (can be used in queries)
CREATE OR REPLACE FUNCTION get_active_items_with_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  condition TEXT,
  buying_price DECIMAL,
  estimated_cost DECIMAL,
  swap_for TEXT,
  location TEXT,
  images TEXT[],
  receipt_image TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.user_id,
    i.name,
    i.description,
    i.category,
    i.condition,
    i.buying_price,
    i.estimated_cost,
    i.swap_for,
    i.location,
    i.images,
    i.receipt_image,
    i.status,
    i.created_at,
    i.updated_at,
    COALESCE(u.full_name, 'Anonymous') as full_name,
    u.avatar_url
  FROM items i
  LEFT JOIN users u ON i.user_id = u.id
  WHERE i.status = 'active'
  ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;