































































































































































































































































































































































# TASK ASSIGNMENT DOCUMENT
## Student Mobile Application (React Native)

**Assigned to:** Eman (SU92-BSITM-F22-022)  
**Component:** Student Mobile App - iOS & Android  
**Technology Stack:** React Native, Expo (or React Native CLI), React Navigation, Redux Toolkit, Socket.io-client, React Native Maps, Push Notifications

---

## 📋 PROJECT OVERVIEW

You are responsible for developing the **Student Mobile Application** - the primary interface for students to track buses in real-time, check seat availability, view routes, and receive critical safety alerts. This app must be professional, user-friendly, and performant.

---

## 🎯 CORE OBJECTIVES

1. Real-time bus tracking with live GPS coordinates
2. Seat availability checking and booking
3. Route visualization with current bus location
4. Push notifications for route deviations and delays
5. User authentication and profile management
6. Stop management (favorite stops, nearby stops)
7. Trip history and analytics

---

## 📱 PHASE-BY-PHASE TASK BREAKDOWN

### **PHASE 1: PROJECT SETUP & FOUNDATION** (Week 1-2)

#### Task 1.1: Environment Setup
- [ ] Install Node.js (v18+), React Native CLI or Expo CLI
- [ ] Initialize React Native project using Expo or React Native CLI
- [ ] Configure Android Studio and Xcode (for iOS development)
- [ ] Set up Git repository and connect to team repository
- [ ] Install and configure ESLint, Prettier for code quality
- [ ] Set up project folder structure:
  ```
  src/
    ├── components/
    ├── screens/
    ├── navigation/
    ├── services/
    ├── store/
    ├── utils/
    ├── constants/
    └── assets/
  ```

#### Task 1.2: Dependencies Installation
- [ ] Install core dependencies:
  - `@react-navigation/native` - Navigation
  - `@react-navigation/bottom-tabs` - Bottom tab navigation
  - `@react-navigation/stack` - Stack navigation
  - `@reduxjs/toolkit` & `react-redux` - State management
- [ ] Install UI libraries:
  - `react-native-vector-icons` - Icons
  - `react-native-paper` or `@rneui/themed` - UI components
  - `react-native-maps` - Map integration
- [ ] Install utilities:
  - `axios` - HTTP requests
  - `socket.io-client` - Real-time updates
  - `@react-native-async-storage/async-storage` - Local storage
  - `react-native-push-notification` - Push notifications
  - `@react-native-community/geolocation` - Location services

#### Task 1.3: Project Configuration
- [ ] Configure app.json/app.config.js (app name, icons, splash screen)
- [ ] Set up environment variables (.env files for dev/staging/prod)
- [ ] Configure API base URLs
- [ ] Set up Redux store structure
- [ ] Configure navigation structure

---

### **PHASE 2: AUTHENTICATION & USER MANAGEMENT** (Week 2-3)

#### Task 2.1: Authentication Screens
- [ ] Design and implement **Login Screen**
  - Email/Student ID input
  - Password input
  - "Remember Me" checkbox
  - "Forgot Password" link
  - Login button with loading state
  - Error handling and validation
- [ ] Design and implement **Registration Screen**
  - Student ID, Name, Email, Password fields
  - Institution selection dropdown
  - Form validation
  - Terms & Conditions acceptance
- [ ] Design and implement **Forgot Password Screen**
  - Email input
  - OTP verification flow
  - Password reset functionality

#### Task 2.2: Authentication Logic
- [ ] Create authentication service (`services/authService.js`)
  - Login API integration
  - Registration API integration
  - Token storage and management
  - Logout functionality
- [ ] Set up Redux slice for authentication (`store/slices/authSlice.js`)
  - Login action
  - Logout action
  - Token refresh logic
  - User state management
- [ ] Implement Protected Routes using navigation guards
- [ ] Create authentication context/provider if needed

#### Task 2.3: User Profile Management
- [ ] Design **Profile Screen**
  - Display user information (name, student ID, institution)
  - Edit profile functionality
  - Profile picture upload (optional)
  - Change password option
- [ ] Create profile service for API calls
- [ ] Implement profile update functionality

---

### **PHASE 3: REAL-TIME BUS TRACKING** (Week 3-5)

#### Task 3.1: Map Integration
- [ ] Integrate React Native Maps
- [ ] Request location permissions (Android & iOS)
- [ ] Get current user location
- [ ] Display map with user's current location marker
- [ ] Configure map styling and region

#### Task 3.2: Bus Tracking Service
- [ ] Create bus tracking service (`services/trackingService.js`)
  - Connect to WebSocket server for real-time updates
  - Handle bus location updates
  - Manage multiple bus tracking
- [ ] Set up Socket.io client connection
  - Connect to Laravel WebSocket server
  - Subscribe to bus channels
  - Handle reconnection logic
- [ ] Create Redux slice for bus tracking (`store/slices/trackingSlice.js`)
  - Store bus locations
  - Store active buses
  - Handle real-time updates

#### Task 3.3: Map Screen Implementation
- [ ] Design **Live Tracking Screen**
  - Full-screen map view
  - Current user location marker (blue)
  - Bus markers with custom icons (different colors for different routes)
  - Route polyline showing bus route
  - Bus info card (tap marker to see details)
  - Refresh button
  - List view toggle (map/list)
- [ ] Implement bus marker customization
  - Different icons for different bus types
  - Animated markers for moving buses
  - Direction indicators
- [ ] Add bus details modal/popup
  - Bus number/ID
  - Route name
  - Driver name
  - Current speed
  - Estimated time to next stop
  - Seat availability

#### Task 3.4: Route Visualization
- [ ] Fetch route data from API
- [ ] Display route polyline on map
- [ ] Show all stops along the route
- [ ] Highlight current bus position on route
- [ ] Display route information panel

---

### **PHASE 4: SEAT AVAILABILITY & BOOKING** (Week 5-6)

#### Task 4.1: Seat Availability Screen
- [ ] Design **Seat Availability Screen**
  - Select bus from list
  - Display bus layout (seating arrangement)
  - Visual indicators:
    - Available seats (green)
    - Occupied seats (red)
    - Reserved seats (yellow)
    - Selected seat (blue highlight)
  - Total capacity and available seats counter
- [ ] Create seat selection component
  - Interactive seat map
  - Tap to select/deselect seat
  - Visual feedback for interactions

#### Task 4.2: Booking Functionality
- [ ] Create booking service (`services/bookingService.js`)
  - Check seat availability API
  - Reserve seat API
  - Cancel reservation API
  - Fetch booking history
- [ ] Implement seat reservation flow
  - Select seat
  - Confirm booking modal
  - Booking confirmation
- [ ] Set up Redux slice for bookings
- [ ] Add booking history view

#### Task 4.3: Booking Management
- [ ] Create **My Bookings Screen**
  - List of active bookings
  - Booking details (date, time, seat number, bus)
  - Cancel booking option
  - Booking status indicators

---

### **PHASE 5: ROUTE & STOP MANAGEMENT** (Week 6-7)

#### Task 5.1: Route Selection
- [ ] Design **Route Selection Screen**
  - List of available routes
  - Route details (start/end points, stops count, duration)
  - Search/filter routes
  - Favorite routes feature
  - Route map preview

#### Task 5.2: Stop Management
- [ ] Create **Stops Screen**
  - List of stops for selected route
  - Stop details (name, address, estimated time)
  - Current stop indicator
  - Nearby stops feature (using GPS)
  - Add stop to favorites
- [ ] Implement stop search functionality
- [ ] Create stop details modal
  - Stop information
  - Buses passing through this stop
  - Next bus arrival time

#### Task 5.3: Favorites & Quick Access
- [ ] Implement favorite routes/stops storage
- [ ] Create quick access widget/card
- [ ] Add "Add to Home" shortcut for favorite routes

---

### **PHASE 6: NOTIFICATIONS & ALERTS** (Week 7-8)

#### Task 6.1: Push Notification Setup
- [ ] Configure Firebase Cloud Messaging (FCM) or Expo Push Notifications
- [ ] Request notification permissions
- [ ] Set up notification service (`services/notificationService.js`)
- [ ] Handle foreground and background notifications
- [ ] Create notification token registration API call

#### Task 6.2: Alert System
- [ ] Implement **Notifications Screen**
  - List of all notifications
  - Notification categories (route deviation, delay, seat available, etc.)
  - Mark as read functionality
  - Notification settings
- [ ] Create notification types:
  - Route deviation alerts
  - Bus delay notifications
  - Seat availability alerts
  - Stop arrival reminders
  - Safety alerts
- [ ] Design notification UI components
  - Custom notification cards
  - Action buttons (View Route, Dismiss)

#### Task 6.3: Real-time Alert Handling
- [ ] Integrate WebSocket alerts
- [ ] Display in-app notifications (toast/banner)
- [ ] Sound/vibration for critical alerts
- [ ] Notification badge counter

---

### **PHASE 7: DASHBOARD & ANALYTICS** (Week 8-9)

#### Task 7.1: Home Dashboard
- [ ] Design **Home Screen** with:
  - Welcome message with user name
  - Quick stats (total trips, on-time percentage)
  - Active buses section
  - Recent bookings
  - Quick actions (Track Bus, Book Seat, View Routes)
  - Weather widget (optional)
- [ ] Create dashboard components
  - Stats cards
  - Quick action buttons
  - Recent activity feed

#### Task 7.2: Trip History
- [ ] Create **Trip History Screen**
  - List of past trips
  - Filter by date range
  - Trip details (date, route, bus, duration)
  - Trip rating/review (optional)
- [ ] Add trip analytics
  - Total trips
  - Average waiting time
  - On-time percentage

#### Task 7.3: Statistics & Reports
- [ ] Create **Statistics Screen**
  - Monthly trip summary
  - Usage charts (weekly/monthly)
  - Time saved calculations
  - Environmental impact (CO2 saved)

---

### **PHASE 8: UI/UX POLISH & OPTIMIZATION** (Week 9-10)

#### Task 8.1: Design System Implementation
- [ ] Create consistent color palette
  - Primary colors (brand colors)
  - Secondary colors
  - Status colors (success, error, warning, info)
- [ ] Implement typography system
  - Font families
  - Font sizes
  - Font weights
- [ ] Create reusable UI components
  - Buttons (primary, secondary, outline)
  - Input fields
  - Cards
  - Modals
  - Loading indicators
  - Empty states

#### Task 8.2: Animations & Transitions
- [ ] Add smooth screen transitions
- [ ] Implement loading animations
- [ ] Add micro-interactions (button press, card tap)
- [ ] Animate map markers and route updates
- [ ] Add skeleton loaders for async data

#### Task 8.3: Responsive Design
- [ ] Ensure compatibility with different screen sizes
- [ ] Test on multiple devices (phones, tablets)
- [ ] Optimize for landscape mode (if needed)

#### Task 8.4: Performance Optimization
- [ ] Optimize map rendering (use clustering for multiple buses)
- [ ] Implement image caching
- [ ] Optimize Redux state updates
- [ ] Reduce unnecessary re-renders
- [ ] Add lazy loading for screens
- [ ] Optimize bundle size

---

### **PHASE 9: TESTING & DEBUGGING** (Week 10-11)

#### Task 9.1: Unit Testing
- [ ] Write unit tests for services
- [ ] Test Redux reducers
- [ ] Test utility functions
- [ ] Set up Jest testing framework

#### Task 9.2: Component Testing
- [ ] Test UI components
- [ ] Test navigation flow
- [ ] Test user interactions

#### Task 9.3: Integration Testing
- [ ] Test API integrations
- [ ] Test WebSocket connections
- [ ] Test push notifications
- [ ] Test location services

#### Task 9.4: Device Testing
- [ ] Test on Android devices (multiple versions)
- [ ] Test on iOS devices (if available)
- [ ] Test on different network conditions
- [ ] Test battery usage and performance
- [ ] Test with GPS disabled/enabled scenarios

---

### **PHASE 10: FINALIZATION & DEPLOYMENT** (Week 11-12)

#### Task 10.1: Error Handling
- [ ] Implement comprehensive error handling
- [ ] Create error boundary components
- [ ] Add error logging service
- [ ] Display user-friendly error messages
- [ ] Handle offline scenarios

#### Task 10.2: Security Implementation
- [ ] Secure token storage (use secure storage)
- [ ] Implement API request encryption
- [ ] Add certificate pinning (if required)
- [ ] Validate user inputs
- [ ] Prevent SQL injection (if applicable)

#### Task 10.3: App Store Preparation
- [ ] Create app icons (all required sizes)
- [ ] Design splash screens
- [ ] Write app description
- [ ] Prepare screenshots for app stores
- [ ] Set up app signing certificates
- [ ] Configure app permissions in manifest

#### Task 10.4: Build & Distribution
- [ ] Create production build (Android APK/AAB)
- [ ] Test production build thoroughly
- [ ] Set up CI/CD pipeline (optional but recommended)
- [ ] Prepare for Google Play Store submission
- [ ] Prepare for Apple App Store submission (if iOS)

#### Task 10.5: Documentation
- [ ] Write component documentation
- [ ] Document API integrations
- [ ] Create user guide/manual
- [ ] Document setup and installation process
- [ ] Create README.md with project overview

---

## 🎨 DESIGN GUIDELINES

### Color Scheme
- **Primary:** #1E88E5 (Blue) - Trust, reliability
- **Secondary:** #43A047 (Green) - Success, safety
- **Warning:** #FB8C00 (Orange) - Alerts
- **Error:** #E53935 (Red) - Critical issues
- **Background:** #F5F5F5 (Light Gray)
- **Text:** #212121 (Dark Gray)

### UI Principles
- **Material Design** or **iOS Human Interface Guidelines** based on platform
- Consistent spacing (4px or 8px grid)
- Clear typography hierarchy
- Touch targets minimum 44x44px
- Accessible contrast ratios (WCAG AA)

---

## 🔗 API INTEGRATIONS REQUIRED

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Bus Tracking Endpoints
- `GET /api/buses` - Get all buses
- `GET /api/buses/{id}` - Get bus details
- `GET /api/buses/{id}/location` - Get bus current location
- `GET /api/routes` - Get all routes
- `GET /api/routes/{id}` - Get route details
- `GET /api/routes/{id}/stops` - Get route stops

### Booking Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/{id}` - Cancel booking
- `GET /api/buses/{id}/seats` - Get seat availability

### WebSocket Channels
- `bus.{busId}.location` - Real-time bus location updates
- `bus.{busId}.deviation` - Route deviation alerts
- `user.{userId}.notifications` - User-specific notifications

---

## 📦 DELIVERABLES

1. **Complete React Native Application**
   - Fully functional Android APK
   - iOS build (if applicable)
   - Source code with proper structure

2. **Documentation**
   - README.md with setup instructions
   - Component documentation
   - API integration guide

3. **Test Reports**
   - Unit test results
   - Integration test results
   - Device testing checklist

4. **Design Assets**
   - App icons
   - Screenshots
   - UI mockups (if created)

---

## ✅ QUALITY CHECKLIST

Before final submission, ensure:
- [ ] All screens are implemented and functional
- [ ] Real-time tracking works accurately
- [ ] Push notifications are working
- [ ] App works in offline mode (graceful degradation)
- [ ] No console errors or warnings
- [ ] Code follows best practices and conventions
- [ ] All API integrations are working
- [ ] App is responsive on different screen sizes
- [ ] Performance is optimized (smooth animations, fast loading)
- [ ] Security measures are implemented
- [ ] Accessibility features are included
- [ ] App is ready for production deployment

---

## 📞 COMMUNICATION & COLLABORATION

- **Daily Standups:** Update team on progress daily
- **Code Reviews:** Submit pull requests for review
- **Backend Integration:** Coordinate with backend team for API endpoints
- **Design Reviews:** Share UI/UX decisions with team
- **Testing:** Coordinate with QA team members

---

## 🚀 SUCCESS CRITERIA

Your work will be considered successful when:
1. Students can track buses in real-time with accuracy
2. Seat booking functionality works seamlessly
3. Push notifications are delivered reliably
4. App has professional UI/UX that users love
5. App performs well on various Android devices
6. All core features are implemented and tested
7. App is ready for production deployment


---

## 📚 LEARNING RESOURCES

- React Native Official Docs: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- Redux Toolkit: https://redux-toolkit.js.org/
- React Native Maps: https://github.com/react-native-maps/react-native-maps
- Socket.io Client: https://socket.io/docs/v4/client-api/

---

**Good luck with your development! Make it professional and user-friendly. 🚀**

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Project: TRACKSY - Smart Student Transport Tracking System*

