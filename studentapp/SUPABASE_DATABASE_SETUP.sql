-- ============================================
-- TRACKSY STUDENT APP - SUPABASE DATABASE SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- 1. Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT UNIQUE,
  name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create push tokens table
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

-- 3. Create routes table (must come before buses)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  origin TEXT,
  destination TEXT,
  distance DECIMAL(10, 2),
  estimated_duration INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create drivers table (must come before buses)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create buses table
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT UNIQUE NOT NULL,
  license_plate TEXT UNIQUE,
  capacity INTEGER DEFAULT 50,
  route_id UUID REFERENCES routes(id),
  driver_id UUID REFERENCES drivers(id),
  status TEXT DEFAULT 'active',
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_speed DECIMAL(5, 2),
  current_heading DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create stops table
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

-- 7. Create route_stops table (junction)
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

-- 8. Create trips table
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

-- 9. Create bookings table
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

-- 10. Create notifications table
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

-- 11. Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  bus_id UUID REFERENCES buses(id),
  route_id UUID REFERENCES routes(id),
  status TEXT DEFAULT 'active',
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create trip_stops table (for tracking stop arrivals)
CREATE TABLE IF NOT EXISTS public.trip_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES stops(id),
  bus_id UUID REFERENCES buses(id),
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON public.buses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stops_updated_at BEFORE UPDATE ON public.stops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR user_profiles
-- ============================================

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

-- ============================================
-- POLICIES FOR user_push_tokens
-- ============================================

DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage own push tokens"
  ON public.user_push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES FOR buses (public read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active buses" ON public.buses;
CREATE POLICY "Anyone can view active buses"
  ON public.buses FOR SELECT
  USING (status = 'active');

-- ============================================
-- POLICIES FOR routes (public read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active routes" ON public.routes;
CREATE POLICY "Anyone can view active routes"
  ON public.routes FOR SELECT
  USING (status = 'active');

-- ============================================
-- POLICIES FOR stops (public read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active stops" ON public.stops;
CREATE POLICY "Anyone can view active stops"
  ON public.stops FOR SELECT
  USING (status = 'active');

-- ============================================
-- POLICIES FOR trips (public read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
CREATE POLICY "Anyone can view trips"
  ON public.trips FOR SELECT
  USING (true);

-- ============================================
-- POLICIES FOR bookings
-- ============================================

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

-- ============================================
-- POLICIES FOR notifications
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES FOR alerts (public read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view alerts" ON public.alerts;
CREATE POLICY "Anyone can view alerts"
  ON public.alerts FOR SELECT
  USING (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_student_id ON public.user_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_expo_token ON public.user_push_tokens(expo_push_token);
CREATE INDEX IF NOT EXISTS idx_buses_status ON public.buses(status);
CREATE INDEX IF NOT EXISTS idx_buses_route_id ON public.buses(route_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON public.routes(status);
CREATE INDEX IF NOT EXISTS idx_stops_status ON public.stops(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_date ON public.bookings(trip_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);

-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime for buses
ALTER PUBLICATION supabase_realtime ADD TABLE buses;

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Enable realtime for trip_stops
ALTER PUBLICATION supabase_realtime ADD TABLE trip_stops;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '✅ Realtime enabled';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next: Test the app!';
END $$;

