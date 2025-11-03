# Next Steps - Complete Backend Setup

## Current Status
✅ Database created: `tracksy`
✅ All migrations exist (22 files)
✅ All controllers implemented
✅ All models created
✅ Routes configured
❌ MySQL password not set in `.env`

## Immediate Action Required

### 1. Set MySQL Password in .env

**Option A - Using nano:**
```bash
nano .env
```
Find `DB_PASSWORD=` and add your password:
```
DB_PASSWORD=your_actual_mysql_password
```
Save: Ctrl+X → Y → Enter

**Option B - Using sed:**
```bash
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=YOUR_PASSWORD/' .env
```
(Replace YOUR_PASSWORD with your actual MySQL root password)

**Option C - Interactive:**
```bash
bash .env.password_helper.sh
```

### 2. Verify Password is Set
```bash
grep "^DB_PASSWORD" .env
```
Should show: `DB_PASSWORD=your_password` (not empty)

### 3. Run Complete Setup
```bash
bash quick_setup_after_password.sh
```

This script will:
- Test database connection
- Run all migrations (22 migrations)
- Generate JWT secret
- Publish Spatie Permission migrations
- Run migrations again (for permission tables)
- Seed database (roles, permissions, etc.)
- Create storage link

### 4. Manual Setup (if script doesn't work)

```bash
# Test connection
php artisan migrate:status

# Run migrations
php artisan migrate

# Generate JWT secret
php artisan jwt:secret --force

# Publish Spatie Permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# Run migrations again (for permission tables)
php artisan migrate

# Seed database
php artisan db:seed

# Create storage link
php artisan storage:link

# Clear and cache config
php artisan config:clear
php artisan config:cache
```

### 5. Start Development Server
```bash
php artisan serve
```

The API will be available at: `http://localhost:8000`

### 6. Test API Endpoints

Test authentication:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### If "Access denied" error persists:
1. Double-check password in `.env`
2. Test password manually:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```
3. Make sure password matches what you used to create database

### If migrations fail:
1. Check database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'tracksy';"
   ```
2. Check `.env` has correct database name:
   ```bash
   grep "^DB_DATABASE" .env
   ```

### If JWT secret generation fails:
- Make sure migrations ran successfully first
- The `jwt_blacklist` table needs to exist

## After Setup Complete

✅ All 22 tables created
✅ Roles and permissions seeded
✅ JWT authentication ready
✅ All API endpoints available
✅ Ready for frontend integration

## API Endpoints Available

See `routes/api.php` for complete list. All endpoints are configured:
- Authentication: `/api/auth/*`
- Driver APIs: `/api/driver/*`
- Student APIs: `/api/buses`, `/api/routes`, `/api/bookings`
- Admin APIs: `/api/admin/*`

---

**Status:** Ready to proceed once MySQL password is set!

