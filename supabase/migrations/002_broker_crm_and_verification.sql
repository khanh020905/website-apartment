-- 002_broker_crm_and_verification.sql
-- SRS §2.1: Broker-optimized form fields
-- SRS §2.2: Verified accounts bypass Check Legit

-- Add broker-specific CRM columns to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_audience TEXT;       -- e.g. "sinh viên", "gia đình", "nhân viên văn phòng"
ALTER TABLE listings ADD COLUMN IF NOT EXISTS commission_rate NUMERIC;    -- broker commission percentage
ALTER TABLE listings ADD COLUMN IF NOT EXISTS booking_note TEXT;          -- Smartos-style booking note

-- Add admin verification route: mark user as verified
-- (is_verified already exists in profiles from 001_initial_schema.sql)

-- Create index on is_verified for faster lookups during listing creation
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified) WHERE is_verified = TRUE;

-- Add RLS policy: only admin can verify users
CREATE POLICY "admin_verify_users" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
