# Using Same Supabase Project for Admin Dashboard

## ✅ Yes, You Can Use the Same Supabase Project!

The admin dashboard is already configured to use the same Supabase project as your student and driver apps. The configuration supports both `VITE_` and `EXPO_PUBLIC_` environment variable prefixes.

## 🔧 Quick Setup

### Option 1: Copy from Student App (Easiest)

```bash
cd /home/irfan/tracksy

# Copy Supabase credentials from student app
cp studentapp/.env admin-dashboard/.env

# Edit the .env file and add VITE_ prefixes (or keep EXPO_PUBLIC_ - both work!)
cd admin-dashboard
```

Then edit `.env` and ensure you have:

```env
# These will work (from student/driver app)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OR use VITE_ prefix (admin dashboard supports both!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: Manual Setup

1. **Get Supabase credentials from student/driver app:**

Check `studentapp/.env` or `driver-app/.env` for:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. **Create `.env` file in admin-dashboard:**

```bash
cd /home/irfan/tracksy/admin-dashboard
touch .env
```

3. **Add to `.env`:**

```env
# Use same values from student/driver app - both prefixes work!
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OR use VITE_ prefix
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration (if you have backend)
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🎯 Why This Works

The admin dashboard's Supabase configuration (`app/lib/config/supabase.ts`) checks for **both** environment variable formats:

```typescript
// Supports both VITE_ and EXPO_PUBLIC_ prefixes
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

This means you can:
- ✅ Use the same `.env` values from student/driver apps
- ✅ Use `EXPO_PUBLIC_*` prefix (same as mobile apps)
- ✅ Use `VITE_*` prefix (standard for Vite projects)
- ✅ Mix both (admin dashboard will find the right one)

## 🚀 Verify Setup

### 1. Check Configuration

Run the dev server:

```bash
cd admin-dashboard
npm run dev
# or
npm run web
```

You should see in the console:
```
🔧 Supabase configured: {
  url: 'https://your-project...',
  hasKey: true,
  isConfigured: true
}
```

### 2. Test Authentication

1. Go to `http://localhost:5173/login`
2. Try logging in with admin credentials
3. Check browser console for any Supabase errors

### 3. Verify Database Connection

The admin dashboard will automatically:
- ✅ Connect to the same Supabase database
- ✅ Use the same authentication system
- ✅ Access the same tables (buses, routes, users, etc.)

## 📊 Shared Database Tables

All three apps (student, driver, admin) share the same Supabase database:

### Tables Used by Admin Dashboard:
- `buses` - Bus management
- `routes` - Route management  
- `stops` - Bus stops
- `user_profiles` - Student profiles
- `driver_profiles` - Driver profiles
- `trips` - Trip management
- `bookings` - Student bookings
- `notifications` - Notifications
- `alerts` - System alerts
- `admin_profiles` - Admin profiles (if created)

### Row Level Security (RLS)

Make sure your Supabase RLS policies allow admin users to access data. You may need to add policies like:

```sql
-- Allow admins to read all buses
CREATE POLICY "Admins can read all buses"
  ON buses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );
```

## 🔐 Admin Authentication

The admin dashboard uses the same Supabase Auth as student/driver apps. You'll need to:

1. **Create admin users in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - Create a new user with email/password
   - Note the user ID

2. **Create admin profile (if needed):**
   ```sql
   INSERT INTO admin_profiles (id, email, name, role)
   VALUES (
     'user-id-from-auth',
     'admin@example.com',
     'Admin User',
     'super_admin'
   );
   ```

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"

**Solution:**
1. Check `.env` file exists in `admin-dashboard/` directory
2. Verify environment variables are set correctly
3. Restart the dev server after changing `.env`

### Issue: "Cannot connect to Supabase"

**Solution:**
1. Verify Supabase URL and key are correct
2. Check Supabase project is active
3. Verify network connection

### Issue: "Authentication failed"

**Solution:**
1. Check if user exists in Supabase Auth
2. Verify email/password is correct
3. Check Supabase Auth settings

### Issue: "Permission denied" when accessing tables

**Solution:**
1. Check RLS policies in Supabase
2. Verify admin user has proper permissions
3. Review table policies in Supabase Dashboard

## ✅ Verification Checklist

- [ ] `.env` file created in `admin-dashboard/` directory
- [ ] Supabase URL and key copied from student/driver app
- [ ] `npm run dev` or `npm run web` starts without errors
- [ ] Console shows "Supabase configured: true"
- [ ] Can access login page
- [ ] Can log in with admin credentials
- [ ] Can access dashboard after login

## 🎉 That's It!

You're now using the same Supabase project for all three apps:
- ✅ Student App → Uses Supabase
- ✅ Driver App → Uses Supabase  
- ✅ Admin Dashboard → Uses Supabase

All three apps share the same database and authentication system!

---

**Last Updated**: Phase 12 Complete
**Status**: ✅ Ready to Use

