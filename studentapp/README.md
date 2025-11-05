# Tracksy Student Mobile Application

## 📱 Overview

Tracksy Student is a React Native mobile application that enables students to track buses in real-time, check seat availability, book seats, view routes, and receive critical safety alerts. This app provides a seamless and user-friendly experience for managing daily transportation needs.

## ✨ Features

### Phase 2: Authentication & User Management
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ Profile management
- ✅ Secure token storage

### Phase 3: Real-time Bus Tracking
- ✅ Live GPS bus tracking
- ✅ Interactive map with bus locations
- ✅ Route visualization
- ✅ Current location tracking
- ✅ WebSocket integration for real-time updates

### Phase 4: Seat Availability & Booking
- ✅ Seat availability checking
- ✅ Interactive seat map
- ✅ Seat booking and cancellation
- ✅ Booking history

### Phase 5: Route & Stop Management
- ✅ Route browsing and selection
- ✅ Route details and stops
- ✅ Favorite routes and stops
- ✅ Nearby stops using GPS

### Phase 6: Notifications & Alerts
- ✅ Real-time alerts via WebSocket
- ✅ Notification categories
- ✅ Push notification setup
- ✅ Alert management

### Phase 7: Dashboard & Analytics
- ✅ Home dashboard with statistics
- ✅ Trip history
- ✅ Usage analytics
- ✅ Environmental impact metrics

### Phase 8: UI/UX Polish
- ✅ Consistent design system
- ✅ Reusable components
- ✅ Smooth animations
- ✅ Performance optimizations

### Phase 9: Testing
- ✅ Unit tests
- ✅ Integration tests
- ✅ Component tests
- ✅ Test coverage reporting

### Phase 10: Finalization
- ✅ Comprehensive error handling
- ✅ Offline support
- ✅ Secure storage
- ✅ Input sanitization
- ✅ Production-ready configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Studio (for Android)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tracksy/student-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
- Update API base URL in `src/constants/index.js`
- Update WebSocket URL if needed

4. Start the development server:
```bash
npm start
```

5. Run on device/simulator:
```bash
npm run android  # For Android
npm run ios       # For iOS
npm run web       # For web
```

## 📱 Installing on Android

For detailed Android installation instructions, see [ANDROID_INSTALLATION_GUIDE.md](./ANDROID_INSTALLATION_GUIDE.md)

**Quick Method (Expo Go):**
1. Install "Expo Go" app from Google Play Store
2. Run `npm start` in this directory
3. Scan QR code with Expo Go app
4. App loads on your device!

**Build APK:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login and build
eas login
eas build --platform android --profile preview
```
```

## 📁 Project Structure

```
student-app/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API and business logic services
│   ├── store/             # Redux store and slices
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── constants/         # Constants and configuration
│   └── __tests__/         # Test files
├── assets/                # Images, icons, etc.
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🧪 Testing

Run tests:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## 🔧 Configuration

### API Configuration
Update `src/constants/index.js`:
```javascript
export const API_BASE_URL = 'https://your-api-url.com/api';
export const WS_BASE_URL = 'https://your-api-url.com';
```

### Environment Variables
For production, use environment variables or Expo's config system.

## 📦 Building for Production

### Android
```bash
# Build APK
eas build --platform android

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS
```bash
# Build for iOS
eas build --platform ios
```

## 🔐 Security Features

- ✅ Secure token storage (ready for expo-secure-store)
- ✅ Input sanitization
- ✅ API request validation
- ✅ Error logging (without sensitive data)
- ✅ Network security

## 📱 App Store Information

### App Name
Tracksy Student

### Description
Track buses in real-time, book seats, and manage your daily commute with Tracksy Student. Get live updates, view routes, and never miss your bus again.

### Key Features
- Real-time bus tracking
- Seat booking
- Route management
- Safety alerts
- Trip history and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For support, email support@tracksy.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Push notifications (FCM/APNs)
- [ ] Offline mode enhancements
- [ ] Additional analytics features
- [ ] Social features
- [ ] Multi-language support

## 👥 Authors

- Eman (SU92-BSITM-F22-022)

## 🙏 Acknowledgments

- React Native team
- Expo team
- All contributors
