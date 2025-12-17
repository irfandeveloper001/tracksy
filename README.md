# TRACKSY - Smart Student Transport Tracking System

A comprehensive transport tracking system with three main applications:
- **Student Mobile App** (React Native/Expo) - by Eman
- **Driver Android App** (React Native) - by Ibsham  
- **Admin Dashboard** (React/Remix) - by Wahib

---

## 📁 Project Structure

```
tracksy/
├── studentapp/           # Student Mobile App (Eman)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── assets/
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── driver-app/           # Driver Android App (Ibsham)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── assets/
│   ├── android/
│   ├── App.tsx
│   └── package.json
│
├── admin-dashboard/      # Admin Dashboard (Wahib)
│   ├── app/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── hooks/
│   ├── package.json
│   └── remix.config.js
│
├── launcher/             # Static web launchpad for all dashboards
│   ├── index.html
│   ├── styles.css
│   └── main.js
│
├── EMAN_TASK_ASSIGNMENT.md
├── IBSHAM_TASK_ASSIGNMENT.md
├── WAHIB_TASK_ASSIGNMENT.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- For Mobile Apps:
  - Android Studio (for Android development)
  - Xcode (for iOS development, macOS only)
- For Admin Dashboard:
  - Modern web browser

### Student App Setup (Eman)

```bash
cd studentapp
npm install
npm start
```

### Driver App Setup (Ibsham)

```bash
cd driver-app
npm install
npm start
# In another terminal:
npm run android
```

### Admin Dashboard Setup (Wahib)

```bash
cd admin-dashboard
npm install
npm run dev
```

### Unified frontend launch

Use the launchpad to open all three dashboards (Admin, Student web, Driver web) alongside each other:

```bash
npm install
npm run web
```

This starts:

- `launcher/` at http://localhost:4000 — click a tile to open any dashboard in a new tab
- Admin dashboard at http://localhost:5173
- Student portal (Expo web) at http://localhost:19007
- Driver portal (Expo web) at http://localhost:19008

> Run the Laravel API separately with `cd backend && php artisan serve`.

---

## 📱 Applications Overview

### 1. Student Mobile App
**Developer:** Eman (SU92-BSITM-F22-022)  
**Tech Stack:** React Native, Expo, React Navigation, Redux Toolkit

**Features:**
- Real-time bus tracking
- Seat availability & booking
- Route visualization
- Push notifications
- Trip history

### 2. Driver Android App
**Developer:** Ibsham (BITM-F21-014)  
**Tech Stack:** React Native CLI, React Navigation, Redux Toolkit

**Features:**
- Background GPS tracking
- Trip management
- Route navigation
- Passenger check-in
- Emergency alerts

### 3. Admin Dashboard
**Developer:** Wahib (SU92-BSITM-F22-030)  
**Tech Stack:** React/Remix, Tailwind CSS, React Query

**Features:**
- Real-time monitoring
- Bus & route management
- User management
- Analytics & reporting
- Alert management

---

## 🔧 Development

### Environment Variables

Each app has its own `.env` file (not committed to git):
- `studentapp/.env`
- `driver-app/.env`
- `admin-dashboard/.env`

See each app's README for required environment variables.

---

## 📚 Documentation

- [Eman's Task Assignment](./EMAN_TASK_ASSIGNMENT.md)
- [Ibsham's Task Assignment](./IBSHAM_TASK_ASSIGNMENT.md)
- [Wahib's Task Assignment](./WAHIB_TASK_ASSIGNMENT.md)

---

## 🏗️ Phase 1 Status

All three applications have completed Phase 1: Project Setup & Foundation:
- ✅ Project structure created
- ✅ Dependencies installed
- ✅ Configuration files set up
- ✅ Folder structure organized

---

## 👥 Team Members

- **Irfan Shakil** (SU92-BSITM-F22-042)
- **Eman** (SU92-BSITM-F22-022) - Student App
- **Ibsham** (BITM-F21-014) - Driver App
- **Duria** (SU92-BITFM-F24-003)
- **Wahib** (SU92-BSITM-F22-030) - Admin Dashboard

---

## 📝 License

This project is part of the Social Entrepreneurship Program (SEP).

---

**Last Updated:** 2024

