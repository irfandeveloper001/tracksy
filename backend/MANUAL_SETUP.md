# Manual Setup Instructions

Since PHP and Composer are not currently in your PATH, please follow these steps:

## 📋 Prerequisites Installation

### 1. Install PHP 8.1+

**Windows:**
1. Download PHP from: https://windows.php.net/download/
2. Extract to `C:\php`
3. Add `C:\php` to your system PATH
4. Restart terminal/PowerShell

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install php8.1 php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath
```

**Mac:**
```bash
brew install php@8.1
```

**Verify Installation:**
```bash
php -v  # Should show PHP 8.1 or higher
```

### 2. Install Composer

**Windows:**
1. Download Composer-Setup.exe from: https://getcomposer.org/download/
2. Run the installer
3. It will add Composer to your PATH automatically

**Linux/Mac:**
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

**Verify Installation:**
```bash
composer --version
```

### 3. Install MySQL

**Windows:**
- Download MySQL Installer from: https://dev.mysql.com/downloads/installer/

**Linux (Ubuntu/Debian):**
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Mac:**
```bash
brew install mysql
```

### 4. Install Redis (Optional but Recommended)

**Windows:**
- Download from: https://github.com/microsoftarchive/redis/releases

**Linux (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Mac:**
```bash
brew install redis
```

## 🚀 After Prerequisites Are Installed

Once PHP and Composer are in your PATH, you can run the automated setup:

### Windows (PowerShell):
```powershell
cd backend
.\setup.ps1
```

### Linux/Mac (Bash):
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Or Run Manually:

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env
# Edit .env and update:
# - DB_DATABASE=tracksy
# - DB_USERNAME=root
# - DB_PASSWORD=your_password

# 3. Generate application key
php artisan key:generate

# 4. Generate JWT secret
php artisan jwt:secret

# 5. Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Run migrations
php artisan migrate

# 7. Seed database
php artisan db:seed

# 8. Create storage link
php artisan storage:link

# 9. Start server
php artisan serve
```

## 🔍 Troubleshooting

### PHP not found
- Make sure PHP is installed
- Check that PHP is in your system PATH
- Restart your terminal/PowerShell after adding PHP to PATH

### Composer not found
- Make sure Composer is installed
- Verify Composer is in your system PATH
- Try running: `where composer` (Windows) or `which composer` (Linux/Mac)

### Database connection errors
- Make sure MySQL is running
- Verify database credentials in `.env`
- Ensure database exists: `mysql -u root -p -e "CREATE DATABASE tracksy;"`
- Check MySQL service: `sudo systemctl status mysql` (Linux)

### JWT secret generation fails
- This might happen if the JWT package needs to be published first
- Run: `php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"`
- Then run: `php artisan jwt:secret`
- Or manually add `JWT_SECRET=your_secret_key` to `.env`

## ✅ Verification

After setup, verify everything works:

```bash
# Check PHP
php -v

# Check Composer
composer --version

# Check routes
php artisan route:list

# Check migrations
php artisan migrate:status

# Test server
php artisan serve
# Then visit: http://localhost:8000
```

---

**Once PHP and Composer are installed and in PATH, you can run the setup script!**

