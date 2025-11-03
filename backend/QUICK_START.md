# Quick Start Guide

## ⚠️ Prerequisites Check

Before running setup, ensure you have:

1. ✅ **PHP 8.1+** installed and in PATH
2. ✅ **Composer** installed and in PATH
3. ✅ **MySQL 8.0+** installed and running
4. ✅ **Redis** installed (optional but recommended)

**Check if installed:**
```bash
php -v          # Should show PHP 8.1+
composer -v     # Should show Composer version
mysql --version # Should show MySQL 8.0+
redis-cli ping  # Should return PONG (if Redis installed)
```

If any are missing, see `MANUAL_SETUP.md` for installation instructions.

## 🚀 Automated Setup

### Windows:
```powershell
cd backend
.\setup.ps1
```

### Linux/Mac:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

## 📝 Manual Setup (Step by Step)

If automated setup doesn't work, follow these steps:

### Step 1: Install Dependencies
```bash
cd backend
composer install
```

### Step 2: Configure Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env file and update:
# DB_DATABASE=tracksy
# DB_USERNAME=root
# DB_PASSWORD=your_password
```

### Step 3: Generate Keys
```bash
php artisan key:generate
php artisan jwt:secret
```

### Step 4: Create Database
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 5: Run Migrations
```bash
php artisan migrate
```

### Step 6: Seed Database
```bash
php artisan db:seed
```

### Step 7: Create Storage Link
```bash
php artisan storage:link
```

### Step 8: Start Server
```bash
php artisan serve
```

API will be available at: `http://localhost:8000/api`

## ✅ Verify Installation

```bash
# Check if server is running
curl http://localhost:8000

# Check routes
php artisan route:list

# Check migrations status
php artisan migrate:status
```

## 📚 Next Steps

1. **Configure .env** with your settings
2. **Test API endpoints** using Postman
3. **Start development** following:
   - `../IRFAN_TASK_ASSIGNMENT.md` (for Irfan)
   - `../DURIA_TASK_ASSIGNMENT.md` (for Duria)

## 🆘 Need Help?

- See `MANUAL_SETUP.md` for detailed installation instructions
- See `INSTALLATION_GUIDE.md` for complete guide
- See `PREREQUISITES_CHECKLIST.md` for file checklist

---

**Happy Coding! 🚀**

