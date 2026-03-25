
-- Append audit and security fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_ip TEXT;

-- Create security audit logs table similar to EZ
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- e.g., 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'REGISTER_SUCCESS'
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for security audit logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON security_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Backend (service role) can insert
CREATE POLICY "Service role can insert audit logs" ON security_audit_logs
  FOR INSERT WITH CHECK (true);
