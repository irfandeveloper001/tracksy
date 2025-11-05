# Quick Start Guide - Driver App

## 🚀 Running the App

### Development Mode

#### 1. Install Dependencies
```bash
cd driver-app
npm install
# or
yarn install
```

#### 2. Start Metro Bundler
```bash
npm start
# or
yarn start
```

#### 3. Run on Android Device/Emulator
```bash
# In a new terminal
npm run android
# or
yarn android
```

#### 4. Run on iOS (macOS only)
```bash
npm run ios
# or
yarn ios
```

---

## 📱 Running on Physical Device

### Android

1. **Enable Developer Mode on your Android device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect device via USB:**
   ```bash
   # Check if device is detected
   adb devices
   ```

3. **Run the app:**
   ```bash
   npm run android
   ```

4. **For WiFi debugging (if needed):**
   ```bash
   adb tcpip 5555
   adb connect <device-ip>:5555
   ```

### iOS (macOS only)

1. **Connect iPhone via USB**
2. **Trust the computer on your iPhone**
3. **Run:**
   ```bash
   npm run ios
   ```

---

## 🏗️ Building for Release

### Android Release Build

#### 1. Generate Keystore (First time only)
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore tracksy-driver-release.keystore -alias tracksy-driver-key -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Configure Signing
Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('tracksy-driver-release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias 'tracksy-driver-key'
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 3. Set Environment Variables
```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_PASSWORD="your-key-password"
```

#### 4. Build Release APK
```bash
cd android
./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

#### 5. Build Release AAB (for Play Store)
```bash
cd android
./gradlew bundleRelease
# AAB will be in: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 Development Commands

### Start Metro Bundler
```bash
npm start
```

### Clear Metro Cache
```bash
npm start -- --reset-cache
```

### Run Android
```bash
npm run android
```

### Run iOS
```bash
npm run ios
```

### Clean Build
```bash
# Android
cd android
./gradlew clean

# iOS (macOS only)
cd ios
xcodebuild clean
```

### Watch Mode
```bash
npm start -- --watch
```

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Node Modules Issues
```bash
rm -rf node_modules
npm install
```

### Android SDK Issues
- Make sure Android SDK is installed
- Set `ANDROID_HOME` environment variable
- Add SDK tools to PATH

### Permission Issues
- Check AndroidManifest.xml for permissions
- Grant location permissions on device
- Check app settings for permissions

---

## 📋 Pre-Run Checklist

Before running the app, ensure:

- [ ] Node.js installed (v18+)
- [ ] npm or yarn installed
- [ ] Dependencies installed (`npm install`)
- [ ] Android SDK installed (for Android)
- [ ] Xcode installed (for iOS, macOS only)
- [ ] Android device/emulator running (for Android)
- [ ] Backend API running (if testing API integration)
- [ ] Environment variables configured (if needed)

---

## 🔐 Environment Setup

### Create `.env` file (if needed)
```bash
# API Configuration
API_BASE_URL=http://localhost:8000/api
WS_BASE_URL=http://localhost:8000

# For production, use your production API URL
# API_BASE_URL=https://api.yourdomain.com/api
# WS_BASE_URL=https://api.yourdomain.com
```

---

## 📱 Testing on Device

### Android
1. Enable USB debugging
2. Connect device
3. Run `npm run android`
4. App will install and launch automatically

### iOS
1. Connect iPhone
2. Trust computer
3. Run `npm run ios`
4. App will install and launch automatically

---

## 🚀 Quick Commands Summary

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build Android release
cd android && ./gradlew assembleRelease

# Build Android bundle (Play Store)
cd android && ./gradlew bundleRelease
```

---

## 📝 Notes

- Make sure your backend API is running if testing API integration
- For location tracking, ensure location permissions are granted
- For background location, ensure background location permission is granted
- Check device logs for debugging: `adb logcat` (Android)

---

## 🆘 Need Help?

Refer to:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `TESTING_GUIDE.md` - Testing instructions
- `RELEASE_CHECKLIST.md` - Pre-release checklist

