# Phase 2: Authentication & Authorization - Setup Guide

## ✅ Completed Features

Phase 2 is now complete with the following features:

### 1. **Supabase Authentication Integration**
- ✅ Supabase client configuration
- ✅ Auth service with login, logout, session management
- ✅ Email verification support
- ✅ Password reset flow

### 2. **Authentication Pages**
- ✅ Professional Login Page with form validation
- ✅ Forgot Password Page
- ✅ Reset Password Page
- ✅ Remember Me functionality

### 3. **Session Management**
- ✅ Auto-refresh tokens (every 30 minutes)
- ✅ Session persistence
- ✅ Auto-logout on token expiry
- ✅ Session timeout handling

### 4. **Role-Based Access Control (RBAC)**
- ✅ Four role levels: Super Admin, Admin, Manager, Viewer
- ✅ Permission-based access control
- ✅ Role hierarchy system
- ✅ Protected route components

### 5. **Audit Logging**
- ✅ Automatic action logging
- ✅ Admin activity tracking
- ✅ IP address and user agent capture
- ✅ Audit log viewing (admin only)

### 6. **Real-time Updates**
- ✅ Supabase Realtime integration
- ✅ Bus location updates
- ✅ Alert notifications
- ✅ Dashboard updates

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd admin-dashboard
npm install
```

### Step 2: Configure Supabase

1. **Create a Supabase Project** (if not already created)
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Setup SQL**
   - Open Supabase SQL Editor
   - Run the SQL from `SUPABASE_DATABASE_SETUP.sql`
   - This creates:
     - `admin_profiles` table
     - `audit_logs` table
     - RLS policies
     - Triggers and functions

3. **Create Environment File**
   - Create `.env` file in `admin-dashboard/` directory
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

### Step 3: Create First Admin User

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Click "Add User"** → "Create New User"
3. **Fill in the form:**
   - Email: `admin@example.com`
   - Password: `your_secure_password`
   - **User Metadata** (important!):
     ```json
     {
       "name": "Super Admin",
       "role": "super_admin",
       "permissions": []
     }
     ```
4. **Confirm Email** (or set email confirmation to disabled in Supabase settings)

### Step 4: Enable Realtime (Free Tier)

1. **Go to Supabase Dashboard** → Database → Replication
2. **Enable Realtime** for the following tables:
   - `buses`
   - `routes`
   - `alerts`
   - `trips`
   - `admin_profiles` (optional)

3. **Note:** Free tier includes 500MB database and 2GB bandwidth
   - Realtime is included in free tier
   - Up to 200 concurrent connections

### Step 5: Run the Application

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## 📋 Available Roles

### Super Admin
- Full system access
- All permissions
- Can manage all admins
- Can view all audit logs

### Admin
- Most management features
- Can manage users, buses, routes
- Can generate reports
- Limited to own audit logs

### Manager
- View and edit operations
- Can manage buses and routes
- Can view analytics
- Limited permissions

### Viewer
- Read-only access
- Can view dashboard
- Can view reports
- No editing permissions

## 🔐 Security Features

1. **Row Level Security (RLS)**
   - All tables protected with RLS policies
   - Users can only access their own data
   - Super admins have elevated access

2. **Audit Logging**
   - All admin actions logged
   - IP address tracking
   - User agent tracking
   - Action history

3. **Session Management**
   - Secure token storage
   - Auto-refresh tokens
   - Auto-logout on expiry
   - Session timeout warnings

## 🔄 Real-time Updates

The dashboard automatically updates in real-time using Supabase Realtime:

- **Bus Locations**: Updated every few seconds
- **Alerts**: Instant notifications
- **Trip Status**: Real-time updates
- **User Activity**: Live updates

## 📝 Next Steps

Phase 2 is complete! You can now:

1. ✅ Login with admin credentials
2. ✅ Access protected routes
3. ✅ View real-time updates
4. ✅ See audit logs

**Ready for Phase 3**: Dashboard Overview & Real-time Monitoring

## 🐛 Troubleshooting

### "Cannot log in"
- Check Supabase credentials in `.env`
- Verify user has `role` in user_metadata
- Check browser console for errors

### "Access denied"
- Verify user role is set correctly
- Check RLS policies in Supabase
- Ensure admin_profiles row exists

### "Real-time not working"
- Enable Realtime in Supabase Dashboard
- Check table replication settings
- Verify Supabase project is active

### "Session expires quickly"
- Check token refresh interval (30 minutes)
- Verify Supabase project settings
- Check browser storage (localStorage)

## 📚 Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Router v7 Docs](https://reactrouter.com/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

