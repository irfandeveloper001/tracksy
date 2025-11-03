# TRACKSY Backend Setup Script
# Run this script after PHP and Composer are installed

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "TRACKSY Backend Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if PHP is installed
Write-Host "Checking PHP..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1 | Select-Object -First 1
    if ($phpVersion -match "PHP (\d+)\.(\d+)") {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        if ($major -gt 8 -or ($major -eq 8 -and $minor -ge 1)) {
            Write-Host "✓ PHP $major.$minor found" -ForegroundColor Green
        } else {
            Write-Host "✗ PHP version must be 8.1 or higher (found: $major.$minor)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "✗ PHP is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install PHP 8.1+ from https://www.php.net/downloads.php" -ForegroundColor Yellow
    exit 1
}

# Check if Composer is installed
Write-Host "Checking Composer..." -ForegroundColor Yellow
try {
    $composerVersion = composer --version 2>&1 | Select-Object -First 1
    Write-Host "✓ Composer found: $composerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Composer is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Please install Composer from https://getcomposer.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting installation..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/7] Installing dependencies..." -ForegroundColor Cyan
composer install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Copy .env.example to .env
Write-Host "[2/7] Configuring environment..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "  ⚠ Please update .env with your database credentials and other settings" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Generate application key
Write-Host "[3/7] Generating application key..." -ForegroundColor Cyan
php artisan key:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate application key" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Application key generated" -ForegroundColor Green
Write-Host ""

# Step 4: Generate JWT secret
Write-Host "[4/7] Generating JWT secret..." -ForegroundColor Cyan
php artisan jwt:secret
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ JWT secret generation failed (package may need to be configured first)" -ForegroundColor Yellow
    Write-Host "  You can manually add JWT_SECRET to .env file" -ForegroundColor Yellow
} else {
    Write-Host "✓ JWT secret generated" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check database connection before migrations
Write-Host "[5/7] Running migrations..." -ForegroundColor Cyan
Write-Host "  ⚠ Make sure your database is created and .env is configured" -ForegroundColor Yellow
php artisan migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Migrations failed. Please check:" -ForegroundColor Red
    Write-Host "  - Database is created" -ForegroundColor Yellow
    Write-Host "  - .env file has correct database credentials" -ForegroundColor Yellow
    Write-Host "  - Database server is running" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Migrations completed" -ForegroundColor Green
Write-Host ""

# Step 6: Seed database
Write-Host "[6/7] Seeding database..." -ForegroundColor Cyan
php artisan db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Database seeding failed" -ForegroundColor Yellow
} else {
    Write-Host "✓ Database seeded" -ForegroundColor Green
}
Write-Host ""

# Step 7: Create storage link
Write-Host "[7/7] Creating storage link..." -ForegroundColor Cyan
php artisan storage:link
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Storage link creation failed (may already exist)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Storage link created" -ForegroundColor Green
}
Write-Host ""

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your configuration" -ForegroundColor White
Write-Host "2. Start the server: php artisan serve" -ForegroundColor White
Write-Host "3. API will be available at: http://localhost:8000/api" -ForegroundColor White
Write-Host ""

