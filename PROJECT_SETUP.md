# TRACKSY - Project Setup Guide

This document provides a complete guide to setting up and running all three applications in the Tracksy project.

---

## 📁 Project Structure

```
tracksy/
├── student-app/          # Student Mobile App (React Native/Expo) - Eman
├── DriverApp/            # Driver Android App (React Native) - Ibsham
├── admin-dashboard/      # Admin Dashboard (React Router v7) - Wahib
├── EMAN_TASK_ASSIGNMENT.md
├── IBSHAM_TASK_ASSIGNMENT.md
├── WAHIB_TASK_ASSIGNMENT.md
├── README.md
└── PROJECT_SETUP.md
```

---

## 🚀 Quick Setup

### Prerequisites

1. **Node.js** v18 or higher
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** or **yarn**
   - Usually comes with Node.js
   - Verify: `npm --version`

3. **For Mobile Development:**
   - **Android Studio** (for Android)
     - Download from: https://developer.android.com/studio
     - Install Android SDK and configure Android emulator
   - **Xcode** (for iOS - macOS only)
     - Install from App Store

4. **Git** (optional but recommended)
   - Download from: https://git-scm.com/

---

## 📱 Application Setup

### 1. Student App (Eman)

**Location:** `student-app/`  
**Technology:** React Native with Expo

#### Setup Steps:

```bash
# Navigate to student app directory
cd student-app

# Install dependencies
npm install

# Or if you encounter peer dependency issues:
npm install --legacy-peer-deps
```

#### Running the App:

```bash
# Start Expo development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS device/simulator (macOS only)
npm run ios

# Run on web browser
npm run web
```

#### Environment Variables:

Create `student-app/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
EXPO_PUBLIC_WS_URL=http://localhost:8000
EXPO_PUBLIC_MAP_API_KEY=your_google_maps_api_key
```

#### Project Structure:
```
student-app/
├── src/
│   ├── components/      # UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation config
│   ├── services/        # API & services
│   ├── store/           # Redux store
│   ├── utils/           # Utilities
│   ├── constants/       # Constants
│   └── assets/          # Images, fonts
├── App.js               # Main app component
├── app.json             # Expo configuration
└── package.json
```

---

### 2. Driver App (Ibsham)

**Location:** `DriverApp/`  
**Technology:** React Native CLI

#### Setup Steps:

```bash
# Navigate to driver app directory
cd DriverApp

# Install dependencies
npm install

# Or if you encounter peer dependency issues:
npm install --legacy-peer-deps
```

#### Running the App:

```bash
# Start Metro bundler (in one terminal)
npm start

# Run on Android (in another terminal)
npm run android

# Run on iOS (macOS only)
npm run ios
```

#### Android Setup:

1. Open Android Studio
2. Open `DriverApp/android` folder
3. Sync Gradle files
4. Create/start an Android emulator
5. Run `npm run android`

#### Environment Variables:

Create `DriverApp/.env`:
```
API_BASE_URL=http://localhost:8000/api
WS_URL=http://localhost:8000
```

#### Project Structure:
```
DriverApp/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── trip/
│   │   └── navigation/
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── trip/
│   │   └── profile/
│   ├── navigation/
│   ├── services/
│   │   ├── location/
│   │   ├── api/
│   │   └── background/
│   ├── store/
│   │   ├── slices/
│   │   └── middleware/
│   ├── utils/
│   ├── constants/
│   └── assets/
├── android/              # Android native code
├── ios/                  # iOS native code (if applicable)
├── App.tsx               # Main app component
└── package.json
```

**Important:** The driver app requires Android permissions for location tracking. These are already configured in `android/app/src/main/AndroidManifest.xml`.

---

### 3. Admin Dashboard (Wahib)

**Location:** `admin-dashboard/`  
**Technology:** React Router v7 (Remix-style)

#### Setup Steps:

```bash
# Navigate to admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Or if you encounter peer dependency issues:
npm install --legacy-peer-deps
```

#### Running the App:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at: `http://localhost:5173` (or port shown in terminal)

#### Environment Variables:

Create `admin-dashboard/.env`:
```
API_BASE_URL=http://localhost:8000/api
WS_URL=http://localhost:8000
```

#### Project Structure:
```
admin-dashboard/
├── app/
│   ├── components/
│   │   ├── ui/           # UI components
│   │   ├── charts/       # Chart components
│   │   ├── tables/       # Table components
│   │   └── layouts/      # Layout components
│   ├── routes/
│   │   ├── dashboard/
│   │   ├── buses/
│   │   ├── routes/
│   │   ├── users/
│   │   └── analytics/
│   ├── lib/
│   │   ├── api/          # API client
│   │   ├── utils/       # Utilities
│   │   └── constants/   # Constants
│   ├── hooks/           # Custom hooks
│   ├── root.tsx         # Root component
│   └── app.css          # Global styles
├── public/              # Static assets
└── package.json
```

---

## 🔧 Common Issues & Solutions

### 1. Dependency Installation Errors

**Problem:** Peer dependency conflicts or version mismatches

**Solution:**
```bash
npm install --legacy-peer-deps
```

### 2. Metro Bundler Issues (React Native)

**Problem:** Cache issues or module resolution errors

**Solution:**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or
rm -rf node_modules
npm install
```

### 3. Android Build Errors

**Problem:** Gradle sync issues or build failures

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 4. Expo Issues

**Problem:** Expo cache or build issues

**Solution:**
```bash
# Clear Expo cache
expo start -c

# Or reinstall
rm -rf node_modules
npm install
```

### 5. Port Already in Use

**Problem:** Port 3000, 8081, or 5173 already in use

**Solution:**
- Kill the process using the port
- Or use a different port:
  ```bash
  # For React Native
  npm start -- --port 8082
  
  # For Admin Dashboard (check vite.config.ts)
  ```

---

## 📋 Phase 1 Completion Checklist

### Student App (Eman)
- ✅ Project structure created
- ✅ Dependencies installed
- ✅ Redux store configured
- ✅ Navigation setup
- ✅ API service configured
- ✅ Socket service configured
- ✅ Environment variables template created
- ✅ ESLint & Prettier configured

### Driver App (Ibsham)
- ✅ Project structure created
- ✅ Dependencies installed
- ✅ Redux store configured
- ✅ Navigation setup
- ✅ Location service implemented
- ✅ API service configured
- ✅ Socket service configured
- ✅ Android permissions configured
- ✅ Environment variables template created
- ✅ ESLint & Prettier configured

### Admin Dashboard (Wahib)
- ✅ Project structure created
- ✅ Dependencies installed
- ✅ Tailwind CSS configured
- ✅ API client configured
- ✅ Socket service configured
- ✅ Layout components created
- ✅ Environment variables template created
- ✅ ESLint & Prettier configured

---

## 🎯 Next Steps

Each team member should:

1. **Review their task assignment document:**
   - `EMAN_TASK_ASSIGNMENT.md`
   - `IBSHAM_TASK_ASSIGNMENT.md`
   - `WAHIB_TASK_ASSIGNMENT.md`

2. **Start Phase 2 development:**
   - Student App: Authentication & User Management
   - Driver App: Authentication & Driver Profile
   - Admin Dashboard: Authentication & Authorization

3. **Set up backend API:**
   - Coordinate with backend team
   - Update API base URLs in `.env` files
   - Test API endpoints

4. **Begin implementing features:**
   - Follow the phase-by-phase breakdown in task documents
   - Commit code regularly
   - Communicate progress with team

---

## 📞 Team Communication

- **Daily Standups:** Share progress daily
- **Code Reviews:** Submit pull requests for review
- **API Integration:** Coordinate with backend team
- **Design Decisions:** Share UI/UX choices with team

---

## 🔗 Useful Resources

### Documentation
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- React Router: https://reactrouter.com/
- Redux Toolkit: https://redux-toolkit.js.org/
- Tailwind CSS: https://tailwindcss.com/

### Tools
- Android Studio: https://developer.android.com/studio
- VS Code: https://code.visualstudio.com/
- Postman: https://www.postman.com/ (for API testing)

---

**Happy Coding! 🚀**

*Last Updated: 2024*

