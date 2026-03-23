-- 003_fix_profiles_trigger.sql
-- FIX: Drop the broken trigger that causes "Database error" on registration
-- Profile creation is now handled explicitly in server code (auth.ts)

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Add INSERT policy on profiles so server (with service role key) can insert
DO $$ BEGIN
  CREATE POLICY "Allow insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Backfill: create profiles for any existing auth.users that don't have profiles
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(
    CASE 
      WHEN u.raw_user_meta_data->>'role' IN ('user','landlord','broker','admin') 
      THEN (u.raw_user_meta_data->>'role')::user_role 
      ELSE 'user'::user_role 
    END,
    'user'::user_role
  )
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

-- Set admin role for admin@gmail.com specifically
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@gmail.com';
