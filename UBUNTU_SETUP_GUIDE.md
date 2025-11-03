# TRACKSY - Ubuntu Setup Guide

Complete guide to transfer and set up the Tracksy project on Ubuntu.

## 📦 Table of Contents
1. [Transferring Project to Ubuntu](#transferring-project-to-ubuntu)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Backend Setup](#backend-setup)
4. [Admin Dashboard Setup](#admin-dashboard-setup)
5. [Student App Setup](#student-app-setup)
6. [Driver App Setup](#driver-app-setup)
7. [Running the Complete System](#running-the-complete-system)

---

## 🔄 Transferring Project to Ubuntu

### Option 1: Using Git (Recommended)
If the project is in a Git repository:
```bash
# On Ubuntu
git clone <repository-url> tracksy
cd tracksy
```

### Option 2: Using USB/External Drive
1. Copy the entire `tracksy` folder to USB/external drive from Windows
2. Plug USB into Ubuntu machine
3. Copy to your desired location:
```bash
# Mount USB if not auto-mounted, then:
cp -r /media/username/USB_NAME/tracksy ~/projects/
cd ~/projects/tracksy
```

### Option 3: Using SCP/Network Transfer
From Windows PowerShell (if SSH is available):
```powershell
# Install OpenSSH on Windows if needed, then:
scp -r E:\tracksy username@ubuntu-ip:/home/username/projects/
```

### Option 4: Using WSL2 (Windows Subsystem for Linux)
If you're using WSL2, you can access Windows files directly:
```bash
# In WSL2 Ubuntu
cd /mnt/e/tracksy
```

---

## 📋 Prerequisites Installation

### 1. System Updates
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install PHP 8.1+ and Required Extensions
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.1 php8.1-cli php8.1-common php8.1-mysql \
    php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml \
    php8.1-bcmath php8.1-intl php8.1-fpm

# Verify installation
php -v
```

### 3. Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### 4. Install MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Login to MySQL and create database
sudo mysql -u root -p
```

In MySQL:
```sql
CREATE DATABASE tracksy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tracksy_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON tracksy.* TO 'tracksy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Install Redis (Optional but Recommended)
```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
# Should return: PONG
```

### 6. Install Node.js 18+ and npm
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Or using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installation
node -v
npm -v
```

### 7. Install Additional Tools
```bash
# Git (if not installed)
sudo apt install -y git

# Build tools for native modules
sudo apt install -y build-essential

# For React Native (if developing mobile apps on Ubuntu)
sudo apt install -y default-jdk
```

---

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd tracksy/backend
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env file
nano .env
# Or use your preferred editor: vim, code, etc.
```

Update these key values in `.env`:
```env
APP_NAME=TRACKSY
APP_ENV=local
APP_KEY=  # Will be generated
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=tracksy_user
DB_PASSWORD=your_password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. Generate Application Keys
```bash
php artisan key:generate
php artisan jwt:secret
```

### 5. Run Database Migrations
```bash
# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Create storage link
php artisan storage:link
```

### 6. Set Permissions
```bash
# Set proper permissions
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 7. Start Laravel Development Server
```bash
php artisan serve
# Server will start at: http://localhost:8000
```

Or run on specific host/port:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Using Automated Setup Script
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

---

## 💻 Admin Dashboard Setup

### 1. Navigate to Admin Dashboard Directory
```bash
cd tracksy/admin-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (if needed)
```bash
# Check if .env file exists or create one
# Update API endpoints if necessary
nano .env
```

Example `.env`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

### 4. Start Development Server
```bash
npm run dev
# Dashboard will be available at: http://localhost:5173 (or similar)
```

### 5. Build for Production (Optional)
```bash
npm run build
npm start
```

---

## 📱 Student App Setup

### 1. Navigate to Student App Directory
```bash
cd tracksy/student-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Create .env file if needed
nano .env
```

Example `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:8000
```

### 4. Start Expo Development Server
```bash
npm start
# Or
npx expo start
```

This will:
- Start the Expo development server
- Show QR code for Expo Go app
- Open browser with development tools

**Note:** For mobile app development, you'll need:
- Android Studio for Android development
- Physical device or emulator
- Expo Go app on your device

### 5. Run on Android (if Android Studio is installed)
```bash
npm run android
```

---

## 🚗 Driver App Setup

### 1. Navigate to Driver App Directory
```bash
cd tracksy/driver-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Create .env file if needed
nano .env
```

### 4. Start Development Server
```bash
npm start
```

### 5. Run on Android
```bash
npm run android
```

**Note:** Requires Android Studio and Android SDK configured.

---

## 🚀 Running the Complete System

### Terminal 1: Backend Server
```bash
cd tracksy/backend
php artisan serve
```
**Access:** http://localhost:8000  
**API:** http://localhost:8000/api

### Terminal 2: Admin Dashboard
```bash
cd tracksy/admin-dashboard
npm run dev
```
**Access:** http://localhost:5173 (or port shown)

### Terminal 3: Student App (if developing)
```bash
cd tracksy/student-app
npm start
```

### Terminal 4: Driver App (if developing)
```bash
cd tracksy/driver-app
npm start
```

---

## 🔍 Troubleshooting

### PHP/Composer Issues
```bash
# Check PHP version
php -v

# Check Composer
composer --version

# Clear Composer cache
composer clear-cache
```

### MySQL Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u tracksy_user -p tracksy

# Check if MySQL is listening
sudo netstat -tlnp | grep mysql
```

### Laravel Permission Issues
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Node.js/npm Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :8000
# Or
sudo netstat -tlnp | grep 8000

# Kill process
sudo kill -9 <PID>
```

### Database Migration Issues
```bash
# Reset database (CAUTION: deletes all data)
php artisan migrate:fresh --seed

# Or rollback and re-migrate
php artisan migrate:rollback
php artisan migrate
```

---

## 📝 Quick Reference Commands

### Backend
```bash
# Start server
cd backend && php artisan serve

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check routes
php artisan route:list
```

### Admin Dashboard
```bash
# Start dev server
cd admin-dashboard && npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

### Student App
```bash
# Start Expo
cd student-app && npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

---

## ✅ Verification Checklist

- [ ] PHP 8.1+ installed and working
- [ ] Composer installed and working
- [ ] MySQL installed, running, and database created
- [ ] Redis installed and running (optional)
- [ ] Node.js 18+ and npm installed
- [ ] Backend dependencies installed (`composer install`)
- [ ] Backend `.env` configured
- [ ] Backend migrations run successfully
- [ ] Backend server starts without errors
- [ ] Admin dashboard dependencies installed (`npm install`)
- [ ] Admin dashboard starts without errors
- [ ] Student app dependencies installed (`npm install`)
- [ ] Driver app dependencies installed (`npm install`)

---

## 🎯 Next Steps

1. **Configure API Endpoints:** Update frontend apps to point to backend API
2. **Set up WebSockets:** Configure broadcasting for real-time features
3. **Configure Email:** Set up mail settings in `.env` for notifications
4. **Set up SSL:** Configure HTTPS for production
5. **Deploy:** Follow deployment guides for production environment

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

---

**Last Updated:** 2024  
**For issues or questions, refer to the project README or contact the development team.**

