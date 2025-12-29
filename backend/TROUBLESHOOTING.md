# Troubleshooting Guide - Driver App Backend

## Common Issues and Solutions

### 500 Internal Server Error

If you're getting a 500 error, check the following:

#### 1. Check Laravel Logs
```bash
cd backend
tail -f storage/logs/laravel.log
```

#### 2. Verify Database Connection
```bash
php artisan migrate:status
```

If migrations fail, check your `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

#### 3. Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

#### 4. Check JWT Configuration
```bash
php artisan jwt:secret --force
```

#### 5. Verify Routes
```bash
php artisan route:list --path=driver
```

### CORS Issues

If you see CORS errors in the browser console:

1. Check `config/cors.php` - should allow your frontend origin
2. Verify middleware is registered in `app/Http/Kernel.php`

### Database Connection Issues

1. **Check if database exists:**
   ```bash
   mysql -u your_username -p
   SHOW DATABASES;
   ```

2. **Create database if needed:**
   ```sql
   CREATE DATABASE tracksy;
   ```

3. **Run migrations:**
   ```bash
   php artisan migrate
   ```

### Port Conflicts

If port 8000 is in use:

1. **Find what's using the port:**
   ```bash
   lsof -i :8000
   ```

2. **Use a different port:**
   ```bash
   php artisan serve --port=8001
   ```

3. **Update frontend API URL** in `driver-app/src/constants/index.ts`:
   ```typescript
   export const API_BASE_URL = 'http://localhost:8001/api';
   ```

### JWT Token Issues

1. **Generate new secret:**
   ```bash
   php artisan jwt:secret --force
   ```

2. **Clear old tokens** (if using blacklist):
   ```bash
   php artisan jwt:clear
   ```

### Testing the API

#### Test Root Endpoint
```bash
curl http://localhost:8000/api
```

Expected response:
```json
{
  "message": "Tracksy API",
  "version": "1.0.0",
  "status": "running"
}
```

#### Test Driver Login
```bash
curl -X POST http://localhost:8000/api/driver/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

#### Test Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/driver/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Common Error Messages

#### "SQLSTATE[HY000] [2002] Connection refused"
- Database server is not running
- Wrong database host/port in `.env`

#### "Class 'Tymon\JWTAuth\Facades\JWTAuth' not found"
- JWT package not installed: `composer require tymon/jwt-auth`
- Run: `php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"`

#### "Route [driver.login] not defined"
- Routes not registered: Check `routes/api.php`
- Clear route cache: `php artisan route:clear`

#### "The stream or file could not be opened"
- Storage directory permissions: `chmod -R 775 storage bootstrap/cache`
- Create log file: `touch storage/logs/laravel.log`

### Quick Health Check Script

Create `check_backend.sh`:
```bash
#!/bin/bash
echo "Checking Laravel Backend..."

echo "1. Checking if server is running..."
curl -s http://localhost:8000/api > /dev/null && echo "✅ Server is running" || echo "❌ Server is not running"

echo "2. Checking database connection..."
php artisan migrate:status > /dev/null 2>&1 && echo "✅ Database connected" || echo "❌ Database connection failed"

echo "3. Checking routes..."
php artisan route:list --path=driver | grep -q "driver/login" && echo "✅ Driver routes registered" || echo "❌ Driver routes missing"

echo "4. Checking JWT config..."
php artisan config:show jwt | grep -q "secret" && echo "✅ JWT configured" || echo "❌ JWT not configured"
```

Run it:
```bash
chmod +x check_backend.sh
./check_backend.sh
```


