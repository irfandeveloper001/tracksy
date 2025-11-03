# Setup Status & Instructions

## ⚠️ Current Status

PHP and Composer are **not currently in your system PATH**, so the automated setup commands cannot run yet.

## 📋 What You Need to Do First

### 1. Install PHP 8.1+

**Download & Install:**
- **Windows:** https://windows.php.net/download/
- **Linux (Ubuntu):** `sudo apt install php8.1 php8.1-cli php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath`
- **Mac:** `brew install php@8.1`

**Add to PATH:**
- **Windows:** Add PHP installation directory (e.g., `C:\php`) to System Environment Variables → Path
- **Linux/Mac:** Usually added automatically

**Verify:**
```bash
php -v  # Should show PHP 8.1 or higher
```

### 2. Install Composer

**Download & Install:**
- **Windows:** Download Composer-Setup.exe from https://getcomposer.org/download/
- **Linux/Mac:** `curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer`

**Verify:**
```bash
composer --version
```

### 3. Install MySQL

**Download & Install:**
- **Windows:** https://dev.mysql.com/downloads/installer/
- **Linux:** `sudo apt install mysql-server`
- **Mac:** `brew install mysql`

**Start MySQL:**
```bash
# Windows: MySQL should start automatically
# Linux: sudo systemctl start mysql
# Mac: brew services start mysql
```

## 🚀 Once Prerequisites Are Installed

After PHP and Composer are in your PATH, you can run the setup:

### Option 1: Automated Setup Script

**Windows:**
```powershell
cd backend
.\setup.ps1
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup (Step by Step)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env file - Update these values:
#    DB_DATABASE=tracksy
#    DB_USERNAME=root
#    DB_PASSWORD=your_mysql_password

# 5. Generate application key
php artisan key:generate

# 6. Generate JWT secret
php artisan jwt:secret

# 7. Create database
mysql -u root -p -e "CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 8. Run migrations
php artisan migrate

# 9. Seed database (creates roles and permissions)
php artisan db:seed

# 10. Create storage link
php artisan storage:link

# 11. Start development server
php artisan serve
```

## ✅ Verification Checklist

After running setup, verify:

- [ ] `php -v` shows PHP 8.1+
- [ ] `composer -v` works
- [ ] `composer install` completed successfully
- [ ] `.env` file exists and has database credentials
- [ ] `php artisan key:generate` worked
- [ ] `php artisan jwt:secret` worked (or manually added JWT_SECRET)
- [ ] Database `tracksy` exists
- [ ] `php artisan migrate` completed without errors
- [ ] `php artisan db:seed` completed
- [ ] `php artisan storage:link` created symlink
- [ ] `php artisan serve` starts server
- [ ] `http://localhost:8000` shows API response

## 📚 Documentation Files

I've created these helpful files:

1. **`QUICK_START.md`** - Quick reference guide
2. **`MANUAL_SETUP.md`** - Detailed prerequisite installation
3. **`setup.ps1`** - Automated setup script for Windows
4. **`setup.sh`** - Automated setup script for Linux/Mac
5. **`INSTALLATION_GUIDE.md`** - Complete installation guide
6. **`PREREQUISITES_CHECKLIST.md`** - File checklist

## 🎯 Next Steps

1. **Install PHP and Composer** (see `MANUAL_SETUP.md`)
2. **Run setup script** or follow manual steps above
3. **Verify installation** using checklist above
4. **Start development** following task assignments:
   - `../IRFAN_TASK_ASSIGNMENT.md`
   - `../DURIA_TASK_ASSIGNMENT.md`

## 🆘 Troubleshooting

### "php is not recognized"
- PHP not installed or not in PATH
- Restart terminal/PowerShell after adding to PATH
- See `MANUAL_SETUP.md` for detailed instructions

### "composer is not recognized"
- Composer not installed or not in PATH
- Try reinstalling Composer
- See `MANUAL_SETUP.md` for detailed instructions

### Database connection errors
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### JWT secret generation fails
```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
# Or manually add JWT_SECRET=your_secret_key to .env
```

---

**All setup files are ready! Install PHP and Composer first, then run the setup. 🚀**

