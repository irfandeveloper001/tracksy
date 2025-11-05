# Deployment Guide - Driver App

## 🚀 Pre-Deployment Checklist

### Security
- [x] Secure token storage implemented
- [x] Input sanitization implemented
- [x] API communication secured (HTTPS)
- [x] Input validation implemented
- [ ] Certificate pinning (optional, for high security)

### Build Configuration
- [x] ProGuard rules configured
- [ ] App signing configured
- [ ] Release build tested
- [ ] Performance optimized

### App Store Preparation
- [ ] App icons (all sizes) created
- [ ] Splash screens designed
- [ ] App description written
- [ ] Screenshots prepared
- [ ] Privacy policy prepared

---

## 📦 Build Configuration

### Android Release Build

1. **Configure ProGuard** (already configured)
   - File: `android/app/proguard-rules.pro`
   - Rules for React Native, Maps, Geolocation

2. **Configure App Signing**
   ```bash
   # Generate keystore
   keytool -genkeypair -v -storetype PKCS12 -keystore tracksy-driver-release.keystore -alias tracksy-driver-key -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Update android/app/build.gradle**
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

4. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   # APK will be in android/app/build/outputs/apk/release/
   ```

5. **Build Release AAB (for Play Store)**
   ```bash
   cd android
   ./gradlew bundleRelease
   # AAB will be in android/app/build/outputs/bundle/release/
   ```

---

## 🔐 Security Configuration

### Secure Storage
The app uses `secureStorage.ts` for sensitive data:
- Tokens are encrypted before storage
- User data is encrypted
- Clear all secure data on logout

**For Production:**
Consider upgrading to:
- `expo-secure-store` (Expo projects)
- `react-native-keychain` (better security)
- Proper AES encryption

### API Security
- All API calls use HTTPS
- Tokens are stored securely
- Input validation on all forms
- Input sanitization for all user inputs

### Certificate Pinning (Optional)
For high security, implement certificate pinning:
```typescript
// Use react-native-pinning-success-certificate
import { fetch } from 'react-native-pinning-success-certificate';

const api = axios.create({
  baseURL: API_BASE_URL,
  httpsAgent: new HttpsAgent({
    certs: [certificate], // Your server certificate
  }),
});
```

---

## 📱 App Store Preparation

### App Icons
Create icons in these sizes:
- **Android:**
  - mipmap-mdpi: 48x48
  - mipmap-hdpi: 72x72
  - mipmap-xhdpi: 96x96
  - mipmap-xxhdpi: 144x144
  - mipmap-xxxhdpi: 192x192
  - Play Store: 512x512

### Splash Screens
- Create splash screen images
- Update `app.json` with splash screen configuration
- Android: `android/app/src/main/res/values/styles.xml`

### App Description
**Short Description (80 chars):**
```
Tracksy Driver - Real-time bus tracking and passenger management app
```

**Full Description:**
```
Tracksy Driver is a comprehensive mobile application designed for bus drivers to manage their routes, track their location in real-time, and handle passenger check-ins efficiently.

Features:
- Real-time location tracking with background support
- Route and stop management
- Passenger check-in and seat management
- Emergency alerts and incident reporting
- Trip history and performance analytics
- Offline mode with automatic sync
- Voice navigation prompts
- Large, readable UI optimized for driving

Designed with driver safety in mind, Tracksy Driver features large touch targets, high contrast colors, and minimal interaction requirements.
```

### Screenshots
Prepare screenshots for:
- Dashboard
- Trip Navigation
- Route Map
- Passenger Management
- Profile

---

## 🧪 Pre-Release Testing

### Functional Testing
- [ ] Test all features on release build
- [ ] Test location tracking accuracy
- [ ] Test background location tracking
- [ ] Test offline functionality
- [ ] Test emergency features
- [ ] Test passenger management

### Performance Testing
- [ ] Test app launch time
- [ ] Test memory usage
- [ ] Test battery drain (8-hour trip)
- [ ] Test on different Android versions
- [ ] Test on different screen sizes

### Security Testing
- [ ] Verify token storage security
- [ ] Test input validation
- [ ] Test API security
- [ ] Verify no sensitive data in logs

---

## 📊 Release Notes Template

### Version 1.0.0 (Initial Release)
- Real-time location tracking
- Route and stop management
- Passenger check-in system
- Emergency alerts
- Trip history and analytics
- Offline mode support
- Voice navigation prompts
- Optimized UI for drivers

---

## 🔄 Update Process

### Versioning
Follow semantic versioning:
- MAJOR.MINOR.PATCH
- Example: 1.0.0 → 1.0.1 (patch), 1.1.0 (minor), 2.0.0 (major)

### Update Checklist
1. Update version in `app.json`
2. Update version in `package.json`
3. Update version code in `android/app/build.gradle`
4. Test update process
5. Prepare release notes
6. Build and sign release APK/AAB
7. Upload to Play Store

---

## 🐛 Troubleshooting

### Build Issues
- **Gradle sync failed:** Update Gradle version
- **ProGuard errors:** Check proguard-rules.pro
- **Signing errors:** Verify keystore configuration

### Runtime Issues
- **Location not working:** Check permissions
- **API errors:** Verify API base URL
- **Offline sync failing:** Check network status

---

## 📝 Final Checklist

Before releasing to production:
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security verified
- [ ] App icons and splash screens ready
- [ ] App description written
- [ ] Screenshots prepared
- [ ] Privacy policy prepared
- [ ] Release build tested
- [ ] App signed correctly
- [ ] ProGuard configured
- [ ] Error handling verified
- [ ] Logging disabled in production
- [ ] Analytics configured (if needed)

---

## 🚀 Ready for Deployment!

Follow this guide step by step to ensure a smooth deployment process.

