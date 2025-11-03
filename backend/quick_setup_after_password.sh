#!/bin/bash
echo "=========================================="
echo "TRACKSY Backend - Quick Setup Script"
echo "=========================================="
echo ""
echo "Step 1: Testing database connection..."
php artisan migrate:status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo ""
    echo "Step 2: Running migrations..."
    php artisan migrate
    echo ""
    echo "Step 3: Generating JWT secret..."
    php artisan jwt:secret --force
    echo ""
    echo "Step 4: Publishing Spatie Permission..."
    php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="migrations"
    echo ""
    echo "Step 5: Publishing JWT config..."
    php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
    echo ""
    echo "Step 6: Running migrations again (for permission tables)..."
    php artisan migrate
    echo ""
    echo "Step 7: Running seeders..."
    php artisan db:seed
    echo ""
    echo "Step 8: Creating storage link..."
    php artisan storage:link
    echo ""
    echo "=========================================="
    echo "✅ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Start the server with:"
    echo "  php artisan serve"
    echo ""
else
    echo "❌ Database connection failed!"
    echo "Please check your DB_PASSWORD in .env file"
    echo ""
    echo "Run: grep '^DB_PASSWORD' .env"
    exit 1
fi
