# Using Same Supabase Project for Student & Driver Apps

## ✅ Yes, You Can Use the Same Database!

You can absolutely use the same Supabase project and `.env` file for both apps. Here's how:

### Option 1: Share the Same .env File (Recommended)

1. **Copy the `.env` file from student-app to driver-app:**

```bash
cd /home/irfan/tracksy
cp student-app/.env driver-app/.env
```

Both apps will now use the same Supabase credentials:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_PROJECT_ID`

### Option 2: Use Same Values in Separate .env Files

If you prefer separate `.env` files, just copy the same values:

**student-app/.env:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_PROJECT_ID=your-project-id
```

**driver-app/.env:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_PROJECT_ID=your-project-id
```

---

## 📊 Database Tables

Both apps will share the same database, but use different tables:

### Student App Tables:
- `user_profiles` - Student profiles
- `user_push_tokens` - Push notification tokens
- `buses` - Bus information
- `routes` - Route information
- `stops` - Bus stops
- `route_stops` - Route-stop relationships
- `trips` - Trip information
- `bookings` - Student bookings
- `notifications` - Notifications
- `alerts` - System alerts
- `trip_stops` - Trip stop tracking

### Driver App Tables:
- `driver_profiles` - Driver profiles (NEW - needs to be created)

---

## 🚀 Setup Steps

### 1. Ensure Driver Table Exists

Run this SQL in your Supabase SQL Editor (if not already done):

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
```

### 2. Copy .env File

```bash
cd /home/irfan/tracksy
cp student-app/.env driver-app/.env
```

### 3. Verify Configuration

Both apps should now:
- ✅ Use the same Supabase project
- ✅ Share the same database
- ✅ Have separate tables for students and drivers
- ✅ Use Row Level Security (RLS) for data isolation

---

## 🔒 Security Notes

- **Row Level Security (RLS)** ensures data isolation:
  - Students can only access their own data
  - Drivers can only access their own data
  - Each app only sees its relevant tables

- **Same Auth System**: Both apps use Supabase Auth, so:
  - Users are authenticated in the same system
  - Email verification works the same way
  - Password reset works the same way

---

## ✅ Benefits

1. **Single Database**: All data in one place
2. **Shared Resources**: Buses, routes, stops are shared
3. **Consistent Auth**: Same authentication system
4. **Easier Management**: One Supabase project to manage
5. **Cost Efficient**: One database project instead of two

---

## 🚀 Next Steps

1. Copy `.env` from student-app to driver-app
2. Run the SQL above to create `driver_profiles` table (if not exists)
3. Both apps are ready to use!

---

## 📝 Quick Copy Command

```bash
cd /home/irfan/tracksy
cp student-app/.env driver-app/.env
```

That's it! Both apps will now use the same Supabase project.

