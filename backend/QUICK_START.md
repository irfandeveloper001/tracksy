# Quick Start Guide - Driver App Backend

## 🚀 Get the Backend Running in 5 Minutes

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies (if not done)
```bash
composer install
```

### Step 3: Configure Environment
```bash
# Copy .env.example if .env doesn't exist
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret --force
```

### Step 4: Configure Database in .env
Edit `.env` file and set your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Step 5: Run Migrations
```bash
php artisan migrate
```

### Step 6: Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 7: Start the Server
```bash
php artisan serve
```

The API will be available at: **http://localhost:8000/api**

### Step 8: Test the API
Open a new terminal and run:
```bash
curl http://localhost:8000/api
```

You should see:
```json
{
  "message": "Tracksy API",
  "version": "1.0.0",
  "status": "running"
}
```

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] `curl http://localhost:8000/api` returns JSON response
- [ ] Database migrations completed successfully
- [ ] JWT secret is generated
- [ ] CORS is configured (check `config/cors.php`)

## 🔧 If Something Goes Wrong

### Server Won't Start
- Check if port 8000 is in use: `lsof -i :8000`
- Use different port: `php artisan serve --port=8001`

### Database Errors
- Verify database exists and credentials are correct
- Check database server is running
- Run: `php artisan migrate:status` to check migration status

### 500 Errors
- Check logs: `tail -f storage/logs/laravel.log`
- Clear cache: `php artisan config:clear && php artisan cache:clear`
- Verify `.env` file is configured correctly

### CORS Errors
- Check `config/cors.php` includes your frontend port
- Clear config cache: `php artisan config:clear`

## 📝 Next Steps

Once the backend is running:

1. **Frontend should connect to**: `http://localhost:8000/api`
2. **Test driver login** from the frontend
3. **Check browser console** for any API errors
4. **Check Laravel logs** if issues persist: `storage/logs/laravel.log`

## 🆘 Still Having Issues?

See `TROUBLESHOOTING.md` for detailed solutions to common problems.


