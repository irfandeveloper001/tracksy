# TRACKSY - Complete Project Structure

This document provides an overview of the entire TRACKSY project structure.

## 📁 Root Project Structure

```
tracksy/
├── student-app/              # Student Mobile App (React Native/Expo)
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── screens/          # Screen Components
│   │   ├── navigation/       # Navigation Setup
│   │   ├── services/         # API & Socket Services
│   │   ├── store/            # Redux Store
│   │   ├── utils/            # Utilities
│   │   └── constants/        # Constants
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── DriverApp/                 # Driver Android App (React Native CLI)
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── screens/          # Screen Components
│   │   ├── navigation/       # Navigation Setup
│   │   ├── services/         # API, Location, Socket Services
│   │   ├── store/            # Redux Store
│   │   ├── utils/            # Utilities
│   │   └── constants/        # Constants
│   ├── android/              # Android Native Code
│   ├── App.tsx
│   └── package.json
│
├── admin-dashboard/           # Admin Dashboard (React Router v7)
│   ├── app/
│   │   ├── components/       # UI Components
│   │   ├── routes/           # Route Pages
│   │   ├── lib/              # Services & Utils
│   │   └── hooks/            # Custom Hooks
│   └── package.json
│
├── backend/                   # Laravel Backend API
│   ├── app/
│   │   ├── Http/Controllers/ # API Controllers
│   │   ├── Models/           # Eloquent Models
│   │   ├── Services/         # Business Logic
│   │   ├── Events/           # Broadcasting Events
│   │   └── Exceptions/       # Exception Handlers
│   ├── database/
│   │   ├── migrations/      # Database Migrations
│   │   └── seeders/         # Database Seeders
│   ├── routes/
│   │   ├── api.php          # API Routes
│   │   └── channels.php    # WebSocket Channels
│   └── composer.json
│
├── api-contract/
│   └── openapi.yaml          # OpenAPI Specification
│
├── Documentation/
│   ├── EMAN_TASK_ASSIGNMENT.md
│   ├── IBSHAM_TASK_ASSIGNMENT.md
│   ├── WAHIB_TASK_ASSIGNMENT.md
│   ├── IRFAN_TASK_ASSIGNMENT.md
│   ├── DURIA_TASK_ASSIGNMENT.md
│   ├── BACKEND_SETUP.md
│   ├── PROJECT_SETUP.md
│   └── README.md
│
└── README.md                  # Main Project README
```

## 👥 Team Assignments

### Frontend Developers

1. **Eman (SU92-BSITM-F22-022)**
   - Project: `student-app/`
   - Task: `EMAN_TASK_ASSIGNMENT.md`
   - Technology: React Native (Expo)

2. **Ibsham (BITM-F21-014)**
   - Project: `DriverApp/`
   - Task: `IBSHAM_TASK_ASSIGNMENT.md`
   - Technology: React Native CLI

3. **Wahib (SU92-BSITM-F22-030)**
   - Project: `admin-dashboard/`
   - Task: `WAHIB_TASK_ASSIGNMENT.md`
   - Technology: React Router v7

### Backend Developers

4. **Irfan Shakil (SU92-BSITM-F22-042)**
   - Project: `backend/` (Core Services)
   - Task: `IRFAN_TASK_ASSIGNMENT.md`
   - Technology: Laravel 10+

5. **Duria (SU92-BITFM-F24-003)**
   - Project: `backend/` (Business Logic)
   - Task: `DURIA_TASK_ASSIGNMENT.md`
   - Technology: Laravel 10+

## 🔗 API Contract

All API endpoints are documented in:
- `api-contract/openapi.yaml` - Complete OpenAPI 3.0 specification

## 📱 Applications

1. **Student Mobile App** - Real-time bus tracking, seat booking
2. **Driver Android App** - Trip management, location tracking
3. **Admin Dashboard** - Complete system management

## 🗄️ Database

Database design and migrations are in:
- `backend/database/migrations/` - All migrations
- `BACKEND_SETUP.md` - Complete database schema

## 🚀 Quick Start

### Student App
```bash
cd student-app
npm install
npm start
```

### Driver App
```bash
cd DriverApp
npm install
npm start
```

### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```

### Backend API
```bash
cd backend
composer install
php artisan serve
```

---

**All applications are ready for development! 🎉**

