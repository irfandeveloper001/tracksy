# Quick Start Guide - Admin Dashboard

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Supabase (Same Project as Student/Driver Apps)

**Option A: Use the Setup Script (Recommended)**

```bash
cd /home/irfan/tracksy/admin-dashboard
./setup-shared-supabase.sh
```

This automatically copies Supabase credentials from your student or driver app.

**Option B: Manual Setup**

1. Check your student or driver app `.env` file for:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Create `.env` file in `admin-dashboard/`:
   ```bash
   cd /home/irfan/tracksy/admin-dashboard
   touch .env
   ```

3. Add to `.env`:
   ```env
   # Copy these from studentapp/.env or driver-app/.env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # OR use VITE_ prefix (both work!)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # API Configuration (optional - if you have backend)
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

### Step 2: Install Dependencies

```bash
cd /home/irfan/tracksy/admin-dashboard
npm install
```

### Step 3: Run the Dashboard

```bash
npm run web
# or
npm run dev
```

The dashboard will start at: **http://localhost:5173**

## ✅ Verify Setup

1. **Check Console Output:**
   You should see:
   ```
   🔧 Supabase configured: {
     url: 'https://your-project...',
     hasKey: true,
     isConfigured: true
   }
   ```

2. **Access the Dashboard:**
   - Open http://localhost:5173
   - You should see the login page

3. **Test Login:**
   - Create an admin user in Supabase Dashboard first
   - Then log in with email/password

## 🎯 What's Already Configured

✅ **Supabase Integration:**
- Supports both `VITE_` and `EXPO_PUBLIC_` prefixes
- Uses same Supabase project as student/driver apps
- Automatic authentication handling
- Row Level Security (RLS) ready

✅ **Web Development:**
- `npm run web` works (runs React Router dev server)
- `npm run dev` also works
- Hot reload enabled
- TypeScript support

✅ **Features:**
- All 12 phases complete
- Authentication & Authorization
- Dashboard Overview
- Bus, Route, User Management
- Analytics & Reporting
- Alerts & Notifications
- System Configuration
- Live Map, Trips, Maintenance
- Error Handling & Offline Support

## 🐛 Troubleshooting

### "Supabase credentials not found"

**Solution:**
1. Make sure `.env` file exists in `admin-dashboard/` directory
2. Verify variables are set correctly
3. Restart dev server: `npm run web`

### "Cannot connect to Supabase"

**Solution:**
1. Verify Supabase URL and key from student/driver app `.env`
2. Check Supabase project is active
3. Ensure network connection

### "npm run web" doesn't work

**Solution:**
1. Make sure you're in `admin-dashboard/` directory
2. Run `npm install` first
3. Try `npm run dev` instead (same command)

### Port already in use

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

## 📚 More Information

- **Supabase Setup:** See `SUPABASE_SHARED_SETUP.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Phase Documentation:** See `PHASE*_COMPLETE.md` files

## 🎉 You're Ready!

Your admin dashboard is now configured to use the same Supabase project as your student and driver apps. All three apps share the same database and authentication system!

---

**Need Help?** Check the documentation files or review the setup scripts.

