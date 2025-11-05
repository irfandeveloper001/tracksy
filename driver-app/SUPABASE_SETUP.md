# Supabase Setup for Driver App

## 🔧 Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Note your project URL and anon key

### 2. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
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
```

### 3. Configure Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### 4. Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)

### 5. Configure Email Redirect URLs

1. Go to Authentication → URL Configuration
2. Add redirect URLs:
   - `tracksydriver://` (for mobile)
   - `exp://localhost:8081` (for Expo Go)

---

## ✅ Verification

After setup:
1. Run `npm install`
2. Create `.env` with your Supabase credentials
3. Run `npm start`
4. Test registration and login

---

## 📝 Notes

- Email verification is required for new accounts
- Password reset uses deep linking
- All authentication is handled by Supabase
- User profiles are stored in `driver_profiles` table

