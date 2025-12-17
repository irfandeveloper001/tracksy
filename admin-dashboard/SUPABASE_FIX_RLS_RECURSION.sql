-- ============================================
-- FIX: RLS Policy Violations and Infinite Recursion
-- ============================================
-- This fixes:
-- 1. "infinite recursion detected in policy for relation admin_profiles" error
-- 2. "new row violates row-level security policy" error
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Create a SECURITY DEFINER function to check if user is admin
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Check if user has an admin profile
  -- SECURITY DEFINER allows this to bypass RLS on admin_profiles
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "Admins can manage buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

-- Recreate policies using the function (prevents recursion)
-- Use explicit WITH CHECK for INSERT operations
CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage drivers" ON public.drivers
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage buses" ON public.buses
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- IMPORTANT: Ensure Admin Profile Exists
-- ============================================
-- After running this fix, make sure your user has an admin profile
-- If you don't have one, run this (replace with your user ID):
-- 
-- INSERT INTO public.admin_profiles (id, email, name, role)
-- VALUES (auth.uid(), 'your-email@example.com', 'Your Name', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
--
-- Or use the admin dashboard signup/login which creates it automatically
-- ============================================

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS recursion fix applied!';
  RAISE NOTICE '✅ Admin check function created';
  RAISE NOTICE '✅ Policies updated to use function';
  RAISE NOTICE '✅ INSERT permissions explicitly granted';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '   1. Verify your user has an admin profile';
  RAISE NOTICE '   2. If not, create one using signup/login in admin dashboard';
  RAISE NOTICE '   3. Try creating a bus again';
END $$;

