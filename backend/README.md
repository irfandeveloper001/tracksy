# TRACKSY Backend API

Laravel 10+ backend API for TRACKSY Smart Student Transport Tracking System.

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Composer
- MySQL 8.0+
- Redis 6.0+

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Configure database in .env file
# DB_DATABASE=tracksy
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database (roles and permissions)
php artisan db:seed

# Create storage link
php artisan storage:link
```

### Start Development Server

```bash
# Start Laravel development server
php artisan serve

# In another terminal, start queue worker (for background jobs)
php artisan queue:work

# If using Laravel Echo Server for WebSocket
laravel-echo-server start
```

The API will be available at: `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Student/
│   │   │   ├── Driver/
│   │   │   ├── Admin/
│   │   │   └── Api/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Services/
│   ├── Events/
│   └── Exceptions/
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    ├── api.php
    └── channels.php
```

## 🔗 API Endpoints

See `api-contract/openapi.yaml` for complete API documentation.

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://api.tracksy.com/api`

### Authentication
All endpoints (except login/register) require Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing

```bash
php artisan test
```

## 📚 Documentation

- **Setup Guide:** See `../BACKEND_SETUP.md`
- **Task Assignments:** 
  - `../IRFAN_TASK_ASSIGNMENT.md`
  - `../DURIA_TASK_ASSIGNMENT.md`
- **API Contract:** `../api-contract/openapi.yaml`

## 👥 Team

- **Irfan Shakil** - Core Services & Authentication
- **Duria** - Business Logic & Advanced Features

---

**For complete setup instructions, see BACKEND_SETUP.md**
