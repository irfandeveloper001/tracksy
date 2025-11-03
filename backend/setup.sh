#!/bin/bash

# TRACKSY Backend Setup Script (Linux/Mac)
# Run this script after PHP and Composer are installed

echo "==================================="
echo "TRACKSY Backend Setup"
echo "==================================="
echo ""

# Check if PHP is installed
echo "Checking PHP..."
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1)
    echo "✓ PHP found: $PHP_VERSION"
    php -r "if (version_compare(PHP_VERSION, '8.1.0', '<')) exit(1);" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "✗ PHP version must be 8.1 or higher"
        exit 1
    fi
else
    echo "✗ PHP is not installed"
    echo "  Please install PHP 8.1+ from https://www.php.net/downloads.php"
    exit 1
fi

# Check if Composer is installed
echo "Checking Composer..."
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version)
    echo "✓ Composer found: $COMPOSER_VERSION"
else
    echo "✗ Composer is not installed"
    echo "  Please install Composer from https://getcomposer.org/download/"
    exit 1
fi

echo ""
echo "Starting installation..."
echo ""

# Step 1: Install dependencies
echo "[1/7] Installing dependencies..."
composer install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Copy .env.example to .env
echo "[2/7] Configuring environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
    echo "  ⚠ Please update .env with your database credentials and other settings"
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 3: Generate application key
echo "[3/7] Generating application key..."
php artisan key:generate
if [ $? -ne 0 ]; then
    echo "✗ Failed to generate application key"
    exit 1
fi
echo "✓ Application key generated"
echo ""

# Step 4: Generate JWT secret
echo "[4/7] Generating JWT secret..."
php artisan jwt:secret
if [ $? -ne 0 ]; then
    echo "⚠ JWT secret generation failed (package may need to be configured first)"
    echo "  You can manually add JWT_SECRET to .env file"
else
    echo "✓ JWT secret generated"
fi
echo ""

# Step 5: Run migrations
echo "[5/7] Running migrations..."
echo "  ⚠ Make sure your database is created and .env is configured"
php artisan migrate
if [ $? -ne 0 ]; then
    echo "✗ Migrations failed. Please check:"
    echo "  - Database is created"
    echo "  - .env file has correct database credentials"
    echo "  - Database server is running"
    exit 1
fi
echo "✓ Migrations completed"
echo ""

# Step 6: Seed database
echo "[6/7] Seeding database..."
php artisan db:seed
if [ $? -ne 0 ]; then
    echo "⚠ Database seeding failed"
else
    echo "✓ Database seeded"
fi
echo ""

# Step 7: Create storage link
echo "[7/7] Creating storage link..."
php artisan storage:link
if [ $? -ne 0 ]; then
    echo "⚠ Storage link creation failed (may already exist)"
else
    echo "✓ Storage link created"
fi
echo ""

echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start the server: php artisan serve"
echo "3. API will be available at: http://localhost:8000/api"
echo ""

