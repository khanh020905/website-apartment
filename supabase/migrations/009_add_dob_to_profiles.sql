-- Migration to add dob (Date of Birth) column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;

-- Update RLS if necessary (usually public profiles allow reading and self-updates)
-- If there's an existing comment or trigger, it should be unaffected.

COMMENT ON COLUMN profiles.dob IS 'Date of birth of the user';
