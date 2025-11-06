-- Supabase Database Setup for Admin Dashboard
-- Run this SQL in your Supabase SQL Editor

-- Admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can insert own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON admin_profiles;

-- Policy: Admins can read own profile
CREATE POLICY "Admins can read own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can update own profile
CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admins can insert own profile
CREATE POLICY "Admins can insert own profile"
  ON admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles"
  ON admin_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can read all audit logs" ON audit_logs;

-- Policy: Admins can read own audit logs
CREATE POLICY "Admins can read own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = admin_id);

-- Policy: System can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

-- Policy: Super admins can read all audit logs
CREATE POLICY "Super admins can read all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to handle new admin user creation
CREATE OR REPLACE FUNCTION handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_profiles (id, email, name, role, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')::TEXT,
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'permissions')),
      '{}'::TEXT[]
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'manager', 'viewer'))
  EXECUTE FUNCTION handle_new_admin();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- Enable Realtime for admin_profiles (for real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE admin_profiles;

-- Enable Realtime for audit_logs (optional - for real-time audit monitoring)
-- ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

