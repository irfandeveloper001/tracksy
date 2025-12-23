#!/bin/bash

# Setup script for Driver App Backend
# This script ensures all database tables and routes are properly set up

echo "🚀 Setting up Driver App Backend..."
echo ""

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one first."
    echo "   You can copy .env.example to .env and configure it."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
composer install --no-interaction

echo ""
echo "🗄️  Step 2: Running database migrations..."
php artisan migrate --force

echo ""
echo "🔑 Step 3: Generating application key (if needed)..."
php artisan key:generate --force

echo ""
echo "🔐 Step 4: Generating JWT secret (if needed)..."
php artisan jwt:secret --force

echo ""
echo "📋 Step 5: Clearing and caching configuration..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "✅ Step 6: Verifying routes..."
php artisan route:list --path=driver

echo ""
echo "✨ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your database is configured in .env"
echo "   2. Run: php artisan serve (to start the Laravel server)"
echo "   3. The API will be available at: http://localhost:8000/api"
echo ""
echo "🔍 Driver API endpoints:"
echo "   POST   /api/driver/login"
echo "   POST   /api/driver/signup"
echo "   GET    /api/driver/me (requires auth)"
echo "   POST   /api/driver/logout (requires auth)"
echo "   POST   /api/driver/refresh-token (requires auth)"
echo "   PUT    /api/driver/profile (requires auth)"
echo "   POST   /api/driver/change-password (requires auth)"
echo ""



