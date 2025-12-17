-- ============================================
-- TRACKSY ADMIN DASHBOARD - COMPLETE SUPABASE SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This ensures all tables exist and are properly configured
-- ============================================

-- ============================================
-- 1. ADMIN PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ROUTES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  origin TEXT,
  destination TEXT,
  distance DECIMAL(10, 2),
  estimated_duration INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. DRIVERS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT UNIQUE,
  driver_id TEXT,
  driver_license TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. BUSES TABLE (FIXED - with id field)
-- ============================================
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT UNIQUE NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 50,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'emergency')),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_speed DECIMAL(5, 2),
  current_heading DECIMAL(5, 2),
  last_location_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ALERTS TABLE (for announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add audience_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'alerts' 
    AND column_name = 'audience_type'
  ) THEN
    ALTER TABLE public.alerts 
    ADD COLUMN audience_type TEXT DEFAULT 'all' 
    CHECK (audience_type IN ('all', 'route', 'driver', 'student', 'custom'));
  END IF;
END $$;

-- Add audience_ids column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'alerts' 
    AND column_name = 'audience_ids'
  ) THEN
    ALTER TABLE public.alerts 
    ADD COLUMN audience_ids JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================
-- 6. NOTIFICATIONS TABLE (for user notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add alert_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'alert_id'
  ) THEN
    ALTER TABLE public.notifications 
    ADD COLUMN alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 7. USER PROFILES TABLE (for students)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT UNIQUE,
  name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Admin profiles indexes
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- Routes indexes
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_name ON public.routes(name);

-- Drivers indexes
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON public.drivers(license_number);

-- Buses indexes
CREATE INDEX IF NOT EXISTS idx_buses_bus_number ON public.buses(bus_number);
CREATE INDEX IF NOT EXISTS idx_buses_license_plate ON public.buses(license_plate);
CREATE INDEX IF NOT EXISTS idx_buses_status ON public.buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_route_id ON public.buses(route_id);
CREATE INDEX IF NOT EXISTS idx_buses_driver_id ON public.buses(driver_id);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_audience_type ON public.alerts(audience_type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_alert_id ON public.notifications(alert_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin profiles policies
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can insert their own profile" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Routes policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view routes" ON public.routes;
CREATE POLICY "Anyone can view routes" ON public.routes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage routes" ON public.routes;
CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Drivers policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view drivers" ON public.drivers;
CREATE POLICY "Anyone can view drivers" ON public.drivers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
CREATE POLICY "Admins can manage drivers" ON public.drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Buses policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view buses" ON public.buses;
CREATE POLICY "Anyone can view buses" ON public.buses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage buses" ON public.buses;
CREATE POLICY "Admins can manage buses" ON public.buses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Alerts policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.alerts;
CREATE POLICY "Anyone can view alerts" ON public.alerts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alerts;
CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

-- Notifications policies (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================

-- Enable realtime for buses (students and drivers need live updates)
-- Note: If table already exists in publication, this will show a warning but won't fail
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE buses;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table buses already in realtime publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE routes;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table routes already in realtime publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table alerts already in realtime publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table notifications already in realtime publication';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table drivers already in realtime publication';
  END;
END $$;

-- ============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_buses_updated_at ON public.buses;
CREATE TRIGGER update_buses_updated_at
  BEFORE UPDATE ON public.buses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO CREATE NOTIFICATIONS FROM ALERTS
-- ============================================

-- Function to create notifications when an alert is created
CREATE OR REPLACE FUNCTION create_notifications_from_alert()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  audience_type_val TEXT;
  audience_ids_val JSONB;
BEGIN
  -- Get audience_type and audience_ids from NEW
  -- Use COALESCE to handle NULL values gracefully
  audience_type_val := COALESCE(NEW.audience_type, 'all');
  audience_ids_val := COALESCE(NEW.audience_ids, '[]'::jsonb);
  
  -- If audience_type is 'all', create notifications for all users
  IF audience_type_val = 'all' THEN
    INSERT INTO public.notifications (user_id, type, title, message, severity, alert_id, data)
    SELECT 
      id,
      NEW.type,
      NEW.title,
      NEW.message,
      NEW.severity,
      NEW.id,
      jsonb_build_object('alert_id', NEW.id, 'alert_type', NEW.type)
    FROM auth.users;
  END IF;
  
  -- If audience_type is 'custom' and audience_ids is provided
  IF audience_type_val = 'custom' AND audience_ids_val IS NOT NULL AND jsonb_array_length(audience_ids_val) > 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, severity, alert_id, data)
    SELECT 
      (value::text)::uuid,
      NEW.type,
      NEW.title,
      NEW.message,
      NEW.severity,
      NEW.id,
      jsonb_build_object('alert_id', NEW.id, 'alert_type', NEW.type)
    FROM jsonb_array_elements_text(audience_ids_val);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notifications when alert is created
DROP TRIGGER IF EXISTS trigger_create_notifications_from_alert ON public.alerts;
CREATE TRIGGER trigger_create_notifications_from_alert
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION create_notifications_from_alert();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Realtime enabled for buses, routes, alerts, and notifications';
  RAISE NOTICE '✅ Triggers created for automatic updates';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '   1. Test creating a bus from admin dashboard';
  RAISE NOTICE '   2. Test creating a route from admin dashboard';
  RAISE NOTICE '   3. Test sending an announcement from admin dashboard';
  RAISE NOTICE '   4. Verify students and drivers receive updates in real-time';
END $$;

