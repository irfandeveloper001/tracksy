# TRACKSY Backend - Installation Guide

Complete step-by-step installation guide for the Laravel backend.

## 📋 Prerequisites

1. **PHP 8.1 or higher**
   - Download: https://www.php.net/downloads.php
   - Verify: `php -v`

2. **Composer**
   - Download: https://getcomposer.org/download/
   - Verify: `composer --version`

3. **MySQL 8.0 or higher**
   - Download: https://dev.mysql.com/downloads/
   - Verify: `mysql --version`

4. **Redis 6.0 or higher**
   - Download: https://redis.io/download
   - Verify: `redis-cli ping`

5. **Node.js (optional, for frontend assets)**
   - Download: https://nodejs.org/

## 🚀 Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
composer install
```

### Step 3: Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

### Step 4: Configure Database

Edit `.env` file and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 5: Create Database

```sql
CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using MySQL command line:
```bash
mysql -u root -p -e "CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 6: Configure Redis

Edit `.env` file:

```env
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Step 7: Configure Broadcasting (WebSocket)

**Option A: Using Pusher**

```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
```

**Option B: Using Redis (Laravel Echo Server)**

```env
BROADCAST_DRIVER=redis
```

### Step 8: Run Migrations

```bash
php artisan migrate
```

### Step 9: Publish Spatie Permission Package

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

### Step 10: Seed Database

```bash
php artisan db:seed
```

This will create:
- Roles (student, driver, admin, manager, viewer)
- Permissions
- Assign permissions to roles

### Step 11: Create Storage Link

```bash
php artisan storage:link
```

### Step 12: Clear and Cache Configuration

```bash
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
```

## 🚀 Start Development Server

### Start Laravel Server

```bash
php artisan serve
```

Server will start at: `http://localhost:8000`

### Start Queue Worker (in separate terminal)

```bash
php artisan queue:work
```

### Start WebSocket Server (if using Laravel Echo Server)

Install Laravel Echo Server:
```bash
npm install -g laravel-echo-server
```

Create configuration:
```bash
laravel-echo-server init
```

Start server:
```bash
laravel-echo-server start
```

## 📡 API Endpoints

After starting the server, API will be available at:
- Base URL: `http://localhost:8000/api`
- Health Check: `http://localhost:8000/up`

### Test API

```bash
# Get API info
curl http://localhost:8000/

# Test login (replace credentials)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter AuthTest
```

## 📦 Project Structure

```
backend/
├── app/
│   ├── Http/Controllers/    # All controllers
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic services
│   ├── Events/              # Broadcasting events
│   └── Exceptions/          # Exception handlers
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── routes/
│   ├── api.php              # API routes
│   └── channels.php         # WebSocket channels
└── config/                   # Configuration files
```

## ✅ Verification Checklist

- [ ] PHP 8.1+ installed
- [ ] Composer installed
- [ ] MySQL database created
- [ ] Redis running
- [ ] Dependencies installed (`composer install`)
- [ ] `.env` file configured
- [ ] Application key generated
- [ ] JWT secret generated
- [ ] Migrations run successfully
- [ ] Database seeded
- [ ] Storage link created
- [ ] Server starts without errors
- [ ] API endpoints accessible

## 🔧 Troubleshooting

### Issue: Composer install fails
**Solution:** Update Composer: `composer self-update`

### Issue: JWT secret generation fails
**Solution:** Ensure `.env` file exists and has APP_KEY

### Issue: Migration fails
**Solution:** 
- Check database credentials in `.env`
- Ensure database exists
- Check MySQL user permissions

### Issue: Redis connection fails
**Solution:**
- Ensure Redis server is running: `redis-server`
- Check Redis configuration in `.env`

### Issue: WebSocket broadcasting not working
**Solution:**
- Check broadcasting driver in `.env`
- Ensure Laravel Echo Server is running
- Verify channel authorization in `routes/channels.php`

## 📚 Next Steps

1. Create test users:
   - Use Tinker: `php artisan tinker`
   - Create admin user for testing

2. Test API endpoints:
   - Use Postman
   - Import `api-contract/openapi.yaml`

3. Implement business logic:
   - Follow `IRFAN_TASK_ASSIGNMENT.md`
   - Follow `DURIA_TASK_ASSIGNMENT.md`

## 🎯 Development Workflow

1. **Irfan** works on:
   - Authentication system
   - User management
   - Bus management
   - WebSocket setup

2. **Duria** works on:
   - Route management
   - Booking system
   - Trip management
   - Analytics

3. **Both coordinate on:**
   - Database schema changes
   - API response formats
   - Shared services

---

**Ready to start development! 🚀**

---

*Last Updated: 2024*

