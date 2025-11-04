# 🚀 Quick Start Guide - Running Student App in Browser

## Step 1: Start Backend Server (Required)

The app needs the backend API running. Open a **new terminal** and run:

```bash
cd /home/irfan/tracksy/backend
php artisan serve
```

This will start the backend on `http://localhost:8000`

**Keep this terminal open!**

---

## Step 2: Install Web Dependencies (One-time setup)

If you haven't already, install web support dependencies:

```bash
cd /home/irfan/tracksy/student-app
npm install react-dom@19.1.0 react-native-web@^0.21.0 --legacy-peer-deps
```

---

## Step 3: Start Frontend Web App

In **another terminal**, run:

```bash
cd /home/irfan/tracksy/student-app
npm run web
```

This will:
1. Start Expo development server
2. Automatically open your browser at `http://localhost:19006`
3. Display the app in the browser

---

## Alternative: Use Expo CLI directly

If `npm run web` doesn't work, try:

```bash
cd /home/irfan/tracksy/student-app
npx expo start --web
```

---

## ⚠️ Important Notes for Web Browser Testing

### ✅ What Works:
- Authentication (Login, Register, Profile)
- Route browsing and selection
- Booking management
- Dashboard and statistics
- Notifications (UI)
- Most UI components

### ⚠️ Limitations in Web:
- **Maps**: React Native Maps may not work perfectly in web (may need web alternative)
- **Geolocation**: Browser location permissions required
- **WebSocket**: Should work but may need CORS configuration
- **Push Notifications**: Not available in web browsers

### 🔧 If You See API Errors:
1. Make sure backend is running: `php artisan serve`
2. Check backend is on `http://localhost:8000`
3. Check browser console for CORS errors
4. Verify API base URL in `src/constants/index.js` is `http://localhost:8000/api`

---

## 📱 For Full Testing (Recommended)

For complete testing with all features (maps, location, etc.), use:
- **Android**: `npm run android` (requires Android Studio/emulator)
- **iOS**: `npm run ios` (requires Xcode/simulator)

---

## 🛑 To Stop

- Press `Ctrl+C` in both terminals
- Or close the terminals

