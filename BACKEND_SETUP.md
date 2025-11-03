# TRACKSY Backend - Project Setup & Database Design

**For:** Irfan Shakil & Duria  
**Technology:** Laravel 10+  
**Purpose:** Shared foundation for all backend development

---

## 📋 PROJECT OVERVIEW

This document provides the complete setup guide and database design that both backend developers will use. All database migrations, initial setup, and project structure are defined here to ensure consistency across the entire backend development.

---

## 🚀 PHASE 1: LARAVEL PROJECT SETUP

### Step 1.1: Prerequisites

**Required Software:**
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Node.js 18+ (for frontend assets if needed)
- Git

**Verify Installation:**
```bash
php -v          # Should be 8.1+
composer -v     # Composer should be installed
mysql --version # MySQL should be 8.0+
redis-cli ping  # Should return PONG
```

### Step 1.2: Create Laravel Project

```bash
# Create new Laravel project
composer create-project laravel/laravel tracksy-backend

# Navigate to project
cd tracksy-backend

# Initialize Git
git init
git add .
git commit -m "Initial Laravel setup"
```

### Step 1.3: Install Required Packages

```bash
# Authentication & Security
composer require tymon/jwt-auth
composer require laravel/sanctum
composer require spatie/laravel-permission

# Real-time Broadcasting
composer require pusher/pusher-php-server
composer require predis/predis

# API Development
composer require league/fractal  # API Resources (optional)
composer require spatie/laravel-query-builder  # Query building

# Validation & Forms
composer require intervention/image  # Image handling

# Development Tools
composer require --dev barryvdh/laravel-ide-helper
composer require --dev laravel/pint  # Code formatting
```

### Step 1.4: Configure Environment

**Update `.env` file:**

```env
APP_NAME=TRACKSY
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=root
DB_PASSWORD=

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Broadcasting Configuration
BROADCAST_DRIVER=pusher
# OR use redis
# BROADCAST_DRIVER=redis

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@tracksy.com"
MAIL_FROM_NAME="${APP_NAME}"

# Queue Configuration
QUEUE_CONNECTION=redis

# Cache Configuration
CACHE_DRIVER=redis

# Session Configuration
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# JWT Configuration (after publishing config)
JWT_SECRET=
JWT_TTL=60
JWT_REFRESH_TTL=20160

# SMS Configuration (for Duria)
SMS_PROVIDER=twilio  # or nexmo
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=

# Google Maps API (for Duria)
GOOGLE_MAPS_API_KEY=
```

**Generate Application Key:**
```bash
php artisan key:generate
```

**Generate JWT Secret:**
```bash
php artisan jwt:secret
```

---

## 📁 PROJECT STRUCTURE

Create the following folder structure:

```
tracksy-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ForgotPasswordController.php
│   │   │   │   └── ResetPasswordController.php
│   │   │   ├── Student/
│   │   │   │   └── StudentController.php
│   │   │   ├── Driver/
│   │   │   │   ├── DriverController.php
│   │   │   │   ├── TripController.php
│   │   │   │   ├── LocationController.php
│   │   │   │   └── EmergencyController.php
│   │   │   ├── Admin/
│   │   │   │   ├── AdminController.php
│   │   │   │   ├── BusController.php
│   │   │   │   ├── RouteController.php
│   │   │   │   ├── StopController.php
│   │   │   │   ├── AnalyticsController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   └── AlertController.php
│   │   │   ├── Api/
│   │   │   │   ├── BusController.php
│   │   │   │   ├── RouteController.php
│   │   │   │   └── BookingController.php
│   │   │   └── Controller.php
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   ├── Bus/
│   │   │   ├── Route/
│   │   │   ├── Booking/
│   │   │   └── Trip/
│   │   ├── Resources/
│   │   │   ├── UserResource.php
│   │   │   ├── BusResource.php
│   │   │   ├── RouteResource.php
│   │   │   ├── BookingResource.php
│   │   │   └── TripResource.php
│   │   └── Middleware/
│   │       ├── ApiAuth.php
│   │       ├── RoleMiddleware.php
│   │       └── PermissionMiddleware.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Bus.php
│   │   ├── Route.php
│   │   ├── Stop.php
│   │   ├── Location.php
│   │   ├── Booking.php
│   │   ├── Trip.php
│   │   ├── TripStop.php
│   │   ├── TripPassenger.php
│   │   ├── Notification.php
│   │   ├── Alert.php
│   │   ├── Maintenance.php
│   │   └── DeviceToken.php
│   ├── Services/
│   │   ├── Auth/
│   │   │   ├── AuthService.php
│   │   │   └── PermissionService.php
│   │   ├── Bus/
│   │   │   ├── BusService.php
│   │   │   └── LocationService.php
│   │   ├── Route/
│   │   │   ├── RouteService.php
│   │   │   └── StopService.php
│   │   ├── Booking/
│   │   │   ├── BookingService.php
│   │   │   └── SeatAvailabilityService.php
│   │   ├── Trip/
│   │   │   ├── TripService.php
│   │   │   └── TripStopService.php
│   │   ├── Notification/
│   │   │   ├── NotificationService.php
│   │   │   ├── EmailService.php
│   │   │   └── SMSService.php
│   │   ├── Analytics/
│   │   │   └── AnalyticsService.php
│   │   ├── Alert/
│   │   │   ├── AlertService.php
│   │   │   └── RouteDeviationService.php
│   │   └── Integration/
│   │       ├── MapService.php
│   │       └── PaymentService.php
│   ├── Events/
│   │   ├── BusLocationUpdated.php
│   │   ├── RouteDeviation.php
│   │   ├── TripStarted.php
│   │   ├── TripEnded.php
│   │   └── UserNotification.php
│   ├── Listeners/
│   │   ├── SendNotification.php
│   │   └── BroadcastLocationUpdate.php
│   ├── Broadcast/
│   │   └── LocationChannel.php
│   ├── Jobs/
│   │   ├── SendEmailNotification.php
│   │   ├── SendSMSNotification.php
│   │   └── GenerateReport.php
│   └── Exceptions/
│       ├── ApiException.php
│       └── Handler.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_buses_table.php
│   │   ├── 2024_01_01_000003_create_routes_table.php
│   │   ├── 2024_01_01_000004_create_stops_table.php
│   │   ├── 2024_01_01_000005_create_route_stop_table.php
│   │   ├── 2024_01_01_000006_create_locations_table.php
│   │   ├── 2024_01_01_000007_create_bookings_table.php
│   │   ├── 2024_01_01_000008_create_seat_assignments_table.php
│   │   ├── 2024_01_01_000009_create_trips_table.php
│   │   ├── 2024_01_01_000010_create_trip_stops_table.php
│   │   ├── 2024_01_01_000011_create_trip_passengers_table.php
│   │   ├── 2024_01_01_000012_create_notifications_table.php
│   │   ├── 2024_01_01_000013_create_alerts_table.php
│   │   ├── 2024_01_01_000014_create_device_tokens_table.php
│   │   ├── 2024_01_01_000015_create_maintenance_table.php
│   │   └── 2024_01_01_000016_create_permission_tables.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RoleSeeder.php
│   │   └── PermissionSeeder.php
│   └── factories/
│       ├── UserFactory.php
│       ├── BusFactory.php
│       ├── RouteFactory.php
│       └── BookingFactory.php
├── routes/
│   ├── api.php
│   ├── channels.php
│   └── web.php
└── config/
    ├── jwt.php
    ├── permission.php
    └── broadcasting.php
```

---

## 🗄️ DATABASE DESIGN

### Database Schema Overview

```
users (core table)
├── buses
├── routes
│   └── route_stop (pivot)
│       └── stops
├── locations (bus locations)
├── bookings
│   └── seat_assignments
├── trips
│   ├── trip_stops
│   └── trip_passengers
├── notifications
├── alerts
├── device_tokens
└── maintenance
```

---

## 📊 DETAILED MIGRATIONS

### Migration 1: Users Table

**File:** `database/migrations/2024_01_01_000001_create_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('student_id')->nullable()->unique();
            $table->string('driver_id')->nullable()->unique();
            $table->enum('role', ['student', 'driver', 'admin', 'manager', 'viewer'])->default('student');
            $table->string('institution')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->string('license_number')->nullable();
            $table->integer('assigned_bus_id')->nullable();
            $table->integer('assigned_route_id')->nullable();
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['role', 'email']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### Migration 2: Buses Table

**File:** `database/migrations/2024_01_01_000002_create_buses_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->string('license_plate')->unique();
            $table->enum('bus_type', ['standard', 'premium'])->default('standard');
            $table->integer('capacity');
            $table->foreignId('current_route_id')->nullable()->constrained('routes')->onDelete('set null');
            $table->foreignId('current_driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['active', 'inactive', 'maintenance', 'emergency'])->default('inactive');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'current_route_id']);
            $table->index('current_driver_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};
```

### Migration 3: Routes Table

**File:** `database/migrations/2024_01_01_000003_create_routes_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('start_point');
            $table->string('end_point');
            $table->decimal('distance', 10, 2)->nullable()->comment('Distance in kilometers');
            $table->integer('estimated_duration')->nullable()->comment('Duration in minutes');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
```

### Migration 4: Stops Table

**File:** `database/migrations/2024_01_01_000004_create_stops_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stops', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stops');
    }
};
```

### Migration 5: Route-Stop Pivot Table

**File:** `database/migrations/2024_01_01_000005_create_route_stop_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_stop', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->foreignId('stop_id')->constrained()->onDelete('cascade');
            $table->integer('order')->comment('Order of stop in route');
            $table->integer('estimated_time')->nullable()->comment('Estimated time from previous stop (minutes)');
            $table->timestamps();

            $table->unique(['route_id', 'stop_id']);
            $table->index(['route_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_stop');
    }
};
```

### Migration 6: Locations Table

**File:** `database/migrations/2024_01_01_000006_create_locations_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('accuracy', 8, 2)->nullable()->comment('Accuracy in meters');
            $table->decimal('speed', 8, 2)->nullable()->comment('Speed in km/h');
            $table->decimal('heading', 5, 2)->nullable()->comment('Heading in degrees');
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['bus_id', 'recorded_at']);
            $table->index('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
```

### Migration 7: Bookings Table

**File:** `database/migrations/2024_01_01_000007_create_bookings_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->foreignId('trip_id')->nullable()->constrained()->onDelete('set null');
            $table->string('seat_number');
            $table->date('trip_date');
            $table->string('booking_reference')->unique();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
            $table->index(['bus_id', 'trip_date']);
            $table->index('trip_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
```

### Migration 8: Seat Assignments Table

**File:** `database/migrations/2024_01_01_000008_create_seat_assignments_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seat_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->string('seat_number');
            $table->date('trip_date');
            $table->enum('status', ['available', 'occupied', 'reserved'])->default('reserved');
            $table->timestamps();

            $table->unique(['bus_id', 'seat_number', 'trip_date']);
            $table->index(['bus_id', 'trip_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_assignments');
    }
};
```

### Migration 9: Trips Table

**File:** `database/migrations/2024_01_01_000009_create_trips_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->json('start_location')->nullable()->comment('{latitude, longitude}');
            $table->json('end_location')->nullable()->comment('{latitude, longitude}');
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'cancelled'])->default('not_started');
            $table->decimal('distance', 10, 2)->nullable()->comment('Distance in kilometers');
            $table->integer('duration')->nullable()->comment('Duration in minutes');
            $table->integer('passenger_count')->default(0);
            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['bus_id', 'start_time']);
            $table->index('start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
```

### Migration 10: Trip Stops Table

**File:** `database/migrations/2024_01_01_000010_create_trip_stops_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('stop_id')->constrained()->onDelete('cascade');
            $table->timestamp('scheduled_time');
            $table->timestamp('actual_time')->nullable();
            $table->integer('passengers_boarding')->default(0);
            $table->integer('passengers_alighting')->default(0);
            $table->timestamps();

            $table->index(['trip_id', 'scheduled_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_stops');
    }
};
```

### Migration 11: Trip Passengers Table

**File:** `database/migrations/2024_01_01_000011_create_trip_passengers_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('boarding_stop_id')->constrained('stops')->onDelete('cascade');
            $table->foreignId('alighting_stop_id')->constrained('stops')->onDelete('cascade');
            $table->string('seat_number')->nullable();
            $table->boolean('checked_in')->default(false);
            $table->timestamp('checked_in_at')->nullable();
            $table->boolean('boarded')->default(false);
            $table->timestamp('boarded_at')->nullable();
            $table->boolean('alighted')->default(false);
            $table->timestamp('alighted_at')->nullable();
            $table->timestamps();

            $table->index(['trip_id', 'checked_in']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_passengers');
    }
};
```

### Migration 12: Notifications Table

**File:** `database/migrations/2024_01_01_000012_create_notifications_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'route_deviation',
                'delay',
                'seat_available',
                'stop_arrival',
                'safety',
                'emergency',
                'general'
            ]);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
```

### Migration 13: Alerts Table

**File:** `database/migrations/2024_01_01_000013_create_alerts_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'route_deviation',
                'bus_delay',
                'emergency',
                'maintenance',
                'system_error'
            ]);
            $table->enum('severity', ['critical', 'warning', 'info'])->default('info');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->foreignId('bus_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('route_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->enum('status', ['new', 'acknowledged', 'resolved'])->default('new');
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['status', 'severity']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
```

### Migration 14: Device Tokens Table

**File:** `database/migrations/2024_01_01_000014_create_device_tokens_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_token');
            $table->enum('platform', ['android', 'ios', 'web']);
            $table->string('device_id')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'device_token']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
    }
};
```

### Migration 15: Maintenance Table

**File:** `database/migrations/2024_01_01_000015_create_maintenance_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->text('description')->nullable();
            $table->date('scheduled_date');
            $table->date('completed_date')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('technician')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();

            $table->index(['bus_id', 'status']);
            $table->index('scheduled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance');
    }
};
```

### Migration 16: Permission Tables (Spatie Package)

```bash
# Publish Spatie Permission migrations
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

This will create:
- `permissions` table
- `roles` table
- `model_has_permissions` table
- `model_has_roles` table
- `role_has_permissions` table

---

## 🔧 CONFIGURATION FILES

### Publish JWT Config

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

### Publish Permission Config

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### Configure Broadcasting (routes/channels.php)

```php
<?php

use Illuminate\Support\Facades\Broadcast;

// User-specific channels
Broadcast::channel('user.{userId}.notifications', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Bus location channel (authenticated users)
Broadcast::channel('bus.{busId}.location', function ($user, $busId) {
    return $user !== null;
});

// Driver-specific channels
Broadcast::channel('driver.{driverId}.messages', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId && $user->role === 'driver';
});

Broadcast::channel('driver.{driverId}.trips', function ($user, $driverId) {
    return (int) $user->id === (int) $driverId && $user->role === 'driver';
});

// Admin channels
Broadcast::channel('admin.dashboard', function ($user) {
    return $user->role === 'admin' || $user->role === 'manager';
});

Broadcast::channel('admin.buses', function ($user) {
    return $user->role === 'admin' || $user->role === 'manager';
});

Broadcast::channel('admin.alerts', function ($user) {
    return $user->role === 'admin' || $user->role === 'manager';
});
```

---

## 🗄️ DATABASE SEEDERS

### DatabaseSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
        ]);
    }
}
```

### RoleSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'student']);
        Role::create(['name' => 'driver']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'manager']);
        Role::create(['name' => 'viewer']);
    }
}
```

---

## 📝 INITIAL SETUP STEPS

### 1. Run Migrations

```bash
php artisan migrate
```

### 2. Seed Database

```bash
php artisan db:seed
```

### 3. Create Storage Link

```bash
php artisan storage:link
```

### 4. Clear and Cache Config

```bash
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
```

---

## 🔍 ER DIAGRAM SUMMARY

```
Users (1) ────┐
              │
              ├───< (1:N) Buses (current_driver_id)
              │
              ├───< (1:N) Trips (driver_id)
              │
              └───< (1:N) Bookings (student_id)

Buses (1) ────┐
              │
              ├───< (1:N) Locations (bus_id)
              │
              ├───< (1:N) Trips (bus_id)
              │
              ├───< (1:N) Bookings (bus_id)
              │
              └───< (1:N) Maintenance (bus_id)

Routes (1) ───┐
              │
              ├───< (N:N) Stops (via route_stop)
              │
              ├───< (1:N) Buses (current_route_id)
              │
              └───< (1:N) Trips (route_id)

Trips (1) ────┐
              │
              ├───< (1:N) TripStops (trip_id)
              │
              ├───< (1:N) TripPassengers (trip_id)
              │
              └───< (1:N) Bookings (trip_id)
```

---

## ✅ CHECKLIST

- [ ] Laravel project created
- [ ] All packages installed
- [ ] `.env` configured
- [ ] All migrations created and run
- [ ] Database seeded
- [ ] Project structure created
- [ ] Broadcasting configured
- [ ] JWT configured
- [ ] Permissions configured

---

## 🚀 NEXT STEPS

After completing this setup:

1. **Irfan** should start with:
   - Authentication controllers
   - User management APIs
   - Bus management APIs
   - WebSocket setup

2. **Duria** should start with:
   - Route management APIs
   - Booking system
   - Trip management APIs
   - Analytics services

Both developers should coordinate on:
- Shared models
- Database consistency
- API response formats
- Error handling

---

**This is your shared foundation! Both developers should follow this exactly. 🚀**

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Project: TRACKSY - Smart Student Transport Tracking System*

