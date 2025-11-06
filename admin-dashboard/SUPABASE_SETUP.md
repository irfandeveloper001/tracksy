# Supabase Setup for Admin Dashboard

## ✅ Using the Same Supabase Project

The admin dashboard can use the **same Supabase project** as your student and driver apps. This is recommended for a unified system.

## 🔧 Setup Instructions

### Option 1: Copy from Student/Driver App (Recommended)

1. **Copy the `.env` file from student-app or driver-app:**

```bash
cd /home/irfan/tracksy
cp student-app/.env admin-dashboard/.env
```

2. **Update the environment variable names for Vite:**

Since Vite uses `VITE_` prefix instead of `EXPO_PUBLIC_`, update your `.env` file:

```env
# Copy these from student-app/.env or driver-app/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Or keep both for compatibility
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** The admin dashboard supports both `VITE_` and `EXPO_PUBLIC_` prefixes, so you can use either or both.

### Option 2: Manual Setup

1. **Create `.env` file in `admin-dashboard/`:**

```env
# Supabase Configuration (same as student/driver apps)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Also include EXPO_PUBLIC_ for consistency
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
```

2. **Get your Supabase credentials:**

   - Go to your Supabase project: https://app.supabase.com
   - Navigate to Settings → API
   - Copy the **Project URL** → `VITE_SUPABASE_URL`
   - Copy the **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 🚀 Running the Admin Dashboard

### Development Mode (with `npm run web`)

```bash
cd admin-dashboard
npm install
npm run web
```

This will start the development server at `http://localhost:5173` (or similar).

### Alternative Commands

```bash
# Same as npm run web
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Tables

The admin dashboard will use the same database tables as your student and driver apps:

- `user_profiles` - Student profiles
- `driver_profiles` - Driver profiles
- `buses` - Bus information
- `routes` - Route information
- `stops` - Bus stops
- `route_stops` - Route-stop relationships
- `trips` - Trip information
- `bookings` - Student bookings
- `notifications` - Notifications
- `alerts` - System alerts
- `trip_stops` - Trip stop tracking

## 🔐 Authentication

The admin dashboard uses Supabase Auth with the same authentication system. You'll need to:

1. **Create admin users in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - Create a new user or use existing user
   - Assign admin role (configure in your database)

2. **Configure Row Level Security (RLS):**
   - Admin users should have elevated permissions
   - Set up RLS policies for admin access

## ✅ Verification

After setup:

1. **Check environment variables:**
   ```bash
   cd admin-dashboard
   cat .env
   ```

2. **Start the development server:**
   ```bash
   npm run web
   ```

3. **Check browser console:**
   - Should see: `🔧 Supabase configured: { url: '...', hasKey: true, isConfigured: true }`
   - If not configured, you'll see a warning

4. **Test login:**
   - Navigate to `/login`
   - Try logging in with admin credentials

## 🔄 Sharing Environment Variables

### Sync Script (Optional)

Create a script to sync environment variables:

```bash
#!/bin/bash
# sync-env.sh

# Read from student-app/.env
STUDENT_ENV="student-app/.env"
ADMIN_ENV="admin-dashboard/.env"

if [ -f "$STUDENT_ENV" ]; then
  # Extract Supabase values
  SUPABASE_URL=$(grep "EXPO_PUBLIC_SUPABASE_URL" "$STUDENT_ENV" | cut -d '=' -f2)
  SUPABASE_KEY=$(grep "EXPO_PUBLIC_SUPABASE_ANON_KEY" "$STUDENT_ENV" | cut -d '=' -f2)
  
  # Write to admin-dashboard/.env
  echo "VITE_SUPABASE_URL=$SUPABASE_URL" > "$ADMIN_ENV"
  echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> "$ADMIN_ENV"
  echo "VITE_API_BASE_URL=http://localhost:8000/api" >> "$ADMIN_ENV"
  
  echo "✅ Environment variables synced!"
else
  echo "❌ student-app/.env not found"
fi
```

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"

**Solution:**
1. Check `.env` file exists in `admin-dashboard/`
2. Verify variable names are correct (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Restart the dev server after changing `.env`

### Issue: "npm run web" not working

**Solution:**
1. Make sure you're in the `admin-dashboard` directory
2. Run `npm install` first
3. Check `package.json` has the `web` script:
   ```json
   "scripts": {
     "web": "react-router dev"
   }
   ```

### Issue: Cannot connect to Supabase

**Solution:**
1. Verify Supabase URL and key are correct
2. Check Supabase project is active
3. Verify network connectivity
4. Check browser console for specific errors

### Issue: Authentication not working

**Solution:**
1. Verify admin user exists in Supabase
2. Check RLS policies are configured
3. Verify authentication settings in Supabase dashboard
4. Check browser console for auth errors

## 📝 Notes

- The admin dashboard uses **Vite** which requires `VITE_` prefix for environment variables
- The config also supports `EXPO_PUBLIC_` prefix for compatibility
- You can use the same Supabase project URL and anon key from student/driver apps
- All apps will share the same database and authentication system

---

**Last Updated**: Phase 12 Complete
**Status**: ✅ Ready to Use

