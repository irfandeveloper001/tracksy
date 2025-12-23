# Driver App Backend Setup Guide

This document outlines the backend setup for the Driver App, ensuring all tables, routes, and controllers are properly configured.

## ✅ Database Tables

The following tables are required and should already exist from migrations:

### Core Tables
- ✅ `users` - Contains driver information (driver_id, license_number, assigned_bus_id, assigned_route_id)
- ✅ `routes` - Route information
- ✅ `buses` - Bus information
- ✅ `stops` - Bus stop information
- ✅ `route_stop` - Pivot table for routes and stops
- ✅ `trips` - Trip information (linked to driver_id)
- ✅ `locations` - Location tracking (linked to driver_id)
- ✅ `bookings` - Passenger bookings
- ✅ `trip_stops` - Trip stop tracking
- ✅ `trip_passengers` - Passenger check-in tracking
- ✅ `notifications` - User notifications
- ✅ `alerts` - Emergency alerts
- ✅ `device_tokens` - Push notification tokens

## ✅ API Routes

All driver routes are defined in `routes/api.php` under the `/api/driver` prefix:

### Public Routes (No Authentication)
- `POST /api/driver/login` - Driver login
- `POST /api/driver/signup` - Driver registration

### Protected Routes (Require JWT Authentication)
- `GET /api/driver/me` - Get current driver profile
- `POST /api/driver/logout` - Logout driver
- `POST /api/driver/refresh-token` - Refresh JWT token
- `PUT /api/driver/profile` - Update driver profile
- `POST /api/driver/change-password` - Change password

### Location Routes
- `POST /api/driver/location` - Update driver location
- `POST /api/driver/location/batch` - Batch location updates

### Route Routes
- `GET /api/driver/route` - Get assigned route
- `GET /api/driver/route/stops` - Get route stops
- `POST /api/driver/stops/{id}/arrive` - Mark stop arrival

### Trip Routes
- `POST /api/driver/trips/start` - Start a trip
- `POST /api/driver/trips/{id}/end` - End a trip
- `GET /api/driver/trips/current` - Get current trip
- `GET /api/driver/trips` - Get trip history
- `GET /api/driver/trips/{id}` - Get trip details

### Passenger Routes
- `GET /api/driver/trips/{id}/passengers` - Get trip passengers
- `POST /api/driver/passengers/check-in` - Check in passenger

### Emergency Routes
- `POST /api/driver/emergency` - Send emergency alert
- `POST /api/driver/incidents` - Report incident

## ✅ Controllers

All driver controllers are located in `app/Http/Controllers/Driver/`:

- ✅ `DriverController.php` - Main driver operations (login, signup, profile, routes, passengers)
- ✅ `TripController.php` - Trip management
- ✅ `LocationController.php` - Location tracking
- ✅ `EmergencyController.php` - Emergency alerts and incidents

## ✅ Models

The `User` model (`app/Models/User.php`) includes:

- ✅ Driver-specific fields: `driver_id`, `license_number`, `assigned_bus_id`, `assigned_route_id`
- ✅ Relationships: `assignedBus()`, `assignedRoute()`, `trips()`
- ✅ Scopes: `scopeDrivers()` for querying drivers
- ✅ JWT authentication support

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Configure Environment
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

### 3. Configure Database
Edit `.env` and set your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tracksy
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Start Server
```bash
php artisan serve
```

The API will be available at: `http://localhost:8000/api`

### 6. Verify Setup
```bash
# Check routes
php artisan route:list --path=driver

# Test API endpoint
curl http://localhost:8000/api
```

## 🔍 Testing Driver Endpoints

### Test Login
```bash
curl -X POST http://localhost:8000/api/driver/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

### Test Signup
```bash
curl -X POST http://localhost:8000/api/driver/signup \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "DRV001",
    "name": "John Driver",
    "email": "driver@example.com",
    "password": "password123",
    "license_number": "LIC123456",
    "phone": "+1234567890"
  }'
```

### Test Protected Endpoint (with token)
```bash
curl -X GET http://localhost:8000/api/driver/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 📝 Notes

- All driver routes use JWT authentication via the `ApiAuth` middleware
- Driver users must have `role = 'driver'` in the users table
- The `driver_id` field must be unique
- Drivers can be assigned to buses and routes via `assigned_bus_id` and `assigned_route_id`

## ✅ Verification Checklist

- [ ] Database migrations run successfully
- [ ] JWT secret key generated
- [ ] All routes accessible
- [ ] Driver login works
- [ ] Driver signup works
- [ ] Protected routes require authentication
- [ ] Token refresh works
- [ ] Profile update works



