-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- If startups RLS is off, enable it:
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy cleanly:
DROP POLICY IF EXISTS 
  "Users can only see their own startups" 
  ON startups;

CREATE POLICY "Users can only see their own startups"
ON startups FOR ALL
USING (
  auth_user_id = auth.uid()
  OR auth_user_id IS NULL
);
