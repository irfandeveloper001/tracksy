-- ============================================
-- CHECK AND CREATE ADMIN PROFILE
-- ============================================
-- Run this SQL to check if you have an admin profile
-- and create one if you don't
-- ============================================

-- First, let's see your current user info
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE id = auth.uid();

-- Check if you have an admin profile
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.admin_profiles
WHERE id = auth.uid();

-- If the query above returns no rows, you need to create an admin profile
-- Run this to create one (it will use your current user info):
INSERT INTO public.admin_profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User') as name,
  COALESCE(raw_user_meta_data->>'role', 'admin') as role
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) 
DO UPDATE SET 
  role = COALESCE(EXCLUDED.role, admin_profiles.role, 'admin'),
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify the admin profile was created/updated
SELECT 
  id,
  email,
  name,
  role,
  created_at,
  updated_at
FROM public.admin_profiles
WHERE id = auth.uid();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE id = auth.uid()
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE '✅ Admin profile exists!';
    RAISE NOTICE '✅ You should now be able to create buses, routes, and alerts';
  ELSE
    RAISE NOTICE '⚠️ Admin profile not found. Please check the INSERT statement above.';
  END IF;
END $$;

