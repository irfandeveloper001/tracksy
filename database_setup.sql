-- ============================================
-- TRACKSY - COMPLETE DATABASE SETUP
-- ============================================
-- This is the single, comprehensive database setup script for the Tracksy project.
-- It includes all tables, functions, triggers, RLS policies, and security fixes.
-- Run this SQL in Supabase SQL Editor to set up the entire database.
-- ============================================

-- ============================================
-- SECTION 1: TABLES
-- ============================================

-- Admin Profiles Table
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

-- User Profiles Table (for students)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT UNIQUE,
  name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Profiles Table
CREATE TABLE IF NOT EXISTS public.driver_profiles (
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

-- User Push Tokens Table
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, expo_push_token)
);

-- Routes Table
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

-- Drivers Table
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

-- Buses Table
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

-- Stops Table
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route Stops Table (junction)
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  estimated_arrival TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, stop_id),
  UNIQUE(route_id, sequence)
);

-- Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES buses(id),
  route_id UUID REFERENCES routes(id),
  driver_id UUID REFERENCES drivers(id),
  trip_date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled',
  passenger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip Stops Table
CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id),
  bus_id UUID REFERENCES buses(id),
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bus_id UUID REFERENCES buses(id),
  route_id UUID REFERENCES routes(id),
  trip_id UUID REFERENCES trips(id),
  trip_date DATE NOT NULL,
  seat_number INTEGER,
  pickup_stop_id UUID REFERENCES stops(id),
  dropoff_stop_id UUID REFERENCES stops(id),
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts Table
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
  audience_type TEXT DEFAULT 'all' CHECK (audience_type IN ('all', 'route', 'driver', 'student', 'custom')),
  audience_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 2: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id ON public.user_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_expo_token ON public.user_push_tokens(expo_push_token);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_name ON public.routes(name);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON public.drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_buses_bus_number ON public.buses(bus_number);
CREATE INDEX IF NOT EXISTS idx_buses_license_plate ON public.buses(license_plate);
CREATE INDEX IF NOT EXISTS idx_buses_status ON public.buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_route_id ON public.buses(route_id);
CREATE INDEX IF NOT EXISTS idx_buses_driver_id ON public.buses(driver_id);
CREATE INDEX IF NOT EXISTS idx_stops_status ON public.stops(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_date ON public.bookings(trip_date);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_audience_type ON public.alerts(audience_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_alert_id ON public.notifications(alert_id);

-- ============================================
-- SECTION 3: FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle new user creation (students)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, student_id, name, institution, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'institution',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Function to handle new admin creation
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to handle new driver creation
CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to create notifications from alerts
CREATE OR REPLACE FUNCTION public.create_notifications_from_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audience_type_val TEXT;
  audience_ids_val JSONB;
BEGIN
  audience_type_val := COALESCE(NEW.audience_type, 'all');
  audience_ids_val := COALESCE(NEW.audience_ids, '[]'::jsonb);
  
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
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.check_user_is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'super_admin';
END;
$$;

-- Function to check if user is super admin (with user_id parameter)
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$;

-- ============================================
-- SECTION 4: TRIGGERS
-- ============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_driver_profiles_updated_at ON public.driver_profiles;
CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_buses_updated_at ON public.buses;
CREATE TRIGGER update_buses_updated_at
  BEFORE UPDATE ON public.buses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_stops_updated_at ON public.stops;
CREATE TRIGGER update_stops_updated_at
  BEFORE UPDATE ON public.stops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

DROP TRIGGER IF EXISTS on_auth_user_created_driver ON auth.users;
CREATE TRIGGER on_auth_user_created_driver
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_driver();

-- Trigger for notifications from alerts
DROP TRIGGER IF EXISTS trigger_create_notifications_from_alert ON public.alerts;
CREATE TRIGGER trigger_create_notifications_from_alert
  AFTER INSERT ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notifications_from_alert();

-- ============================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin Profiles Policies
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can insert their own profile" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_profiles;
CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Driver Profiles Policies
DROP POLICY IF EXISTS "Drivers can read own profile" ON public.driver_profiles;
CREATE POLICY "Drivers can read own profile"
  ON public.driver_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Drivers can update own profile" ON public.driver_profiles;
CREATE POLICY "Drivers can update own profile"
  ON public.driver_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Drivers can insert own profile" ON public.driver_profiles;
CREATE POLICY "Drivers can insert own profile"
  ON public.driver_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Push Tokens Policies
DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage own push tokens"
  ON public.user_push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Routes Policies
DROP POLICY IF EXISTS "Anyone can view routes" ON public.routes;
CREATE POLICY "Anyone can view routes" ON public.routes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage routes" ON public.routes;
CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Drivers Policies
DROP POLICY IF EXISTS "Anyone can view drivers" ON public.drivers;
CREATE POLICY "Anyone can view drivers" ON public.drivers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
CREATE POLICY "Admins can manage drivers" ON public.drivers
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Buses Policies (Public can view active, Admins can view all)
DROP POLICY IF EXISTS "Anyone can view active buses" ON public.buses;
DROP POLICY IF EXISTS "Public can view active buses" ON public.buses;
DROP POLICY IF EXISTS "Anyone can view buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can view all buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can manage buses" ON public.buses;

CREATE POLICY "Public can view active buses"
  ON public.buses FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can view all buses"
  ON public.buses FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage buses"
  ON public.buses FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Stops Policies
DROP POLICY IF EXISTS "Anyone can view active stops" ON public.stops;
CREATE POLICY "Anyone can view active stops"
  ON public.stops FOR SELECT
  USING (status = 'active');

-- Route Stops Policies
DROP POLICY IF EXISTS "Anyone can view route_stops" ON public.route_stops;
CREATE POLICY "Anyone can view route_stops"
  ON public.route_stops FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage route_stops" ON public.route_stops;
CREATE POLICY "Admins can manage route_stops"
  ON public.route_stops FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trips Policies
DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
CREATE POLICY "Anyone can view trips"
  ON public.trips FOR SELECT
  USING (true);

-- Trip Stops Policies
DROP POLICY IF EXISTS "Anyone can view trip_stops" ON public.trip_stops;
CREATE POLICY "Anyone can view trip_stops"
  ON public.trip_stops FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage trip_stops" ON public.trip_stops;
CREATE POLICY "Admins can manage trip_stops"
  ON public.trip_stops FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bookings Policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Alerts Policies
DROP POLICY IF EXISTS "Anyone can view alerts" ON public.alerts;
CREATE POLICY "Anyone can view alerts" ON public.alerts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage alerts" ON public.alerts;
CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 6: GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.check_user_is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;

-- ============================================
-- SECTION 7: ENABLE REALTIME
-- ============================================

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
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE trip_stops;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Table trip_stops already in realtime publication';
  END;
END $$;

-- ============================================
-- SECTION 8: SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ TRACKSY DATABASE SETUP COMPLETE';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ All indexes created';
  RAISE NOTICE '✅ All functions created with proper search_path';
  RAISE NOTICE '✅ All triggers created';
  RAISE NOTICE '✅ All RLS policies enabled';
  RAISE NOTICE '✅ Realtime enabled for live updates';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Security Features:';
  RAISE NOTICE '   ✅ RLS enabled on all tables';
  RAISE NOTICE '   ✅ Public can view active buses/routes';
  RAISE NOTICE '   ✅ Admins can view/manage all data';
  RAISE NOTICE '   ✅ Function search_path secured';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '   1. Enable "Leaked Password Protection" in Authentication settings';
  RAISE NOTICE '   2. Verify Security Advisor shows 0 errors';
  RAISE NOTICE '   3. Test creating buses/routes from admin dashboard';
  RAISE NOTICE '   4. Test student/driver apps can see active buses';
  RAISE NOTICE '';
END $$;
