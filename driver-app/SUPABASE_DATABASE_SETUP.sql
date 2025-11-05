-- Supabase Database Setup for Driver App
-- Run this SQL in your Supabase SQL Editor

-- Driver profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  driver_id TEXT UNIQUE,
  phone TEXT,
  license_number TEXT,
  status TEXT DEFAULT 'active',
  assigned_bus JSONB,
  assigned_route JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can read own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can update own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can insert own profile" ON driver_profiles;

-- Policy: Drivers can read their own profile
CREATE POLICY "Drivers can read own profile"
  ON driver_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Drivers can update their own profile
CREATE POLICY "Drivers can update own profile"
  ON driver_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Drivers can insert their own profile
CREATE POLICY "Drivers can insert own profile"
  ON driver_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_driver()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO driver_profiles (id, email, name, driver_id, phone, license_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'driver_id',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'license_number'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;
CREATE TRIGGER on_auth_user_created_driver
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_driver();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_driver_profiles_updated_at ON driver_profiles;
CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

