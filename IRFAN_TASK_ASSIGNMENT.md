# TASK ASSIGNMENT DOCUMENT
## Backend API Development (Laravel) - Part 1

**Assigned to:** Irfan Shakil (SU92-BSITM-F22-042)  
**Component:** Laravel Backend API - Core Services & Authentication  
**Technology Stack:** Laravel 10+, MySQL, Redis, Pusher/Socket.io, JWT, Sanctum

---

## 📋 PROJECT OVERVIEW

You are responsible for developing the **Core Backend API Services** including authentication, user management, bus tracking infrastructure, real-time WebSocket services, and the foundation for all three applications (Student App, Driver App, Admin Dashboard). This is the backbone of the entire Tracksy system.

---

## 🎯 CORE OBJECTIVES

1. Complete authentication and authorization system
2. User management (Students, Drivers, Admins) with role-based access
3. Bus management system with real-time location tracking
4. WebSocket server for real-time updates
5. Database design and migrations
6. API security and validation
7. Core services infrastructure

---

## 🔧 PHASE-BY-PHASE TASK BREAKDOWN

### **PHASE 1: PROJECT SETUP & DATABASE DESIGN** (Week 1-2)

#### Task 1.1: Laravel Project Setup
- [ ] Install Laravel 10+ using Composer
- [ ] Set up project structure and organize folders:
  ```
  app/
    ├── Http/
    │   ├── Controllers/
    │   │   ├── Auth/
    │   │   ├── Student/
    │   │   ├── Driver/
    │   │   ├── Admin/
    │   │   ├── Bus/
    │   │   └── Api/
    │   ├── Requests/
    │   ├── Resources/
    │   └── Middleware/
    ├── Models/
    ├── Services/
    │   ├── Auth/
    │   ├── Bus/
    │   ├── Location/
    │   └── Notification/
    ├── Events/
    ├── Listeners/
    ├── Broadcast/
    └── Exceptions/
  ```
- [ ] Configure `.env` file
- [ ] Set up Git repository
- [ ] Install and configure dependencies:
  - `tymon/jwt-auth` - JWT authentication
  - `laravel/sanctum` - API token authentication
  - `pusher/pusher-php-server` or `laravel-echo-server` - WebSocket
  - `predis/predis` - Redis for caching
  - `spatie/laravel-permission` - Role-based permissions
  - `laravel/passport` (optional) - OAuth2

#### Task 1.2: Database Design & Migrations
- [ ] Create database schema design document
- [ ] Create migration for **users** table:
  - id, name, email, password, student_id (nullable)
  - role (enum: student, driver, admin)
  - institution, phone, avatar
  - email_verified_at, remember_token
  - timestamps, soft_deletes
- [ ] Create migration for **buses** table:
  - id, bus_number, license_plate
  - bus_type (enum: standard, premium)
  - capacity, current_route_id, current_driver_id
  - status (enum: active, inactive, maintenance, emergency)
  - timestamps, soft_deletes
- [ ] Create migration for **routes** table:
  - id, name, start_point, end_point
  - distance, estimated_duration
  - timestamps, soft_deletes
- [ ] Create migration for **stops** table:
  - id, name, address
  - latitude, longitude
  - timestamps
- [ ] Create migration for **route_stop** (pivot) table:
  - route_id, stop_id, order, estimated_time
- [ ] Create migration for **locations** table:
  - id, bus_id, driver_id (nullable)
  - latitude, longitude, accuracy, speed, heading
  - recorded_at, timestamps
- [ ] Create indexes for performance:
  - Index on locations(bus_id, recorded_at)
  - Index on buses(status, current_route_id)
  - Index on routes(name)
  - Index on users(role, email)

#### Task 1.3: Models & Relationships
- [ ] Create **User** model with:
  - Relationships: bookings, trips (as driver)
  - Mutators/Accessors
  - Role checking methods
- [ ] Create **Bus** model with:
  - Relationships: route, driver, locations, trips
  - Status methods
- [ ] Create **Route** model with:
  - Relationships: buses, stops (many-to-many), trips
- [ ] Create **Stop** model with:
  - Relationships: routes (many-to-many)
- [ ] Create **Location** model with:
  - Relationships: bus, driver
  - Scopes for recent locations
- [ ] Implement model factories for testing
- [ ] Create model observers if needed

---

### **PHASE 2: AUTHENTICATION & AUTHORIZATION SYSTEM** (Week 2-3)

#### Task 2.1: JWT Authentication Setup
- [ ] Configure JWT authentication:
  - Publish JWT config
  - Generate JWT secret key
  - Configure token expiration times
- [ ] Create **AuthController**:
  - `login()` - Handle login for all user types
  - `register()` - Student registration
  - `logout()` - Invalidate token
  - `refresh()` - Refresh access token
  - `me()` - Get current authenticated user
- [ ] Create **ForgotPasswordController**:
  - `sendResetLink()` - Send password reset email
  - `reset()` - Reset password with token
- [ ] Implement login logic:
  - Validate credentials
  - Generate JWT token
  - Return user data with token
  - Handle different user roles
- [ ] Create custom **LoginRequest** validation:
  - Email/ID validation
  - Password validation
  - Role checking (if needed)

#### Task 2.2: Role-Based Access Control (RBAC)
- [ ] Install and configure Spatie Laravel Permission
- [ ] Create roles:
  - Student
  - Driver
  - Admin
  - Manager (optional)
  - Viewer (optional)
- [ ] Create permissions:
  - buses.* (manage buses)
  - routes.* (manage routes)
  - students.* (manage students)
  - drivers.* (manage drivers)
  - bookings.* (manage bookings)
  - trips.* (manage trips)
  - analytics.view
- [ ] Assign default permissions to roles
- [ ] Create **RoleMiddleware**:
  - Check user role
  - Check permissions
- [ ] Create **PermissionService**:
  - Helper methods for permission checking
- [ ] Update User model with role methods

#### Task 2.3: API Authentication Middleware
- [ ] Create **ApiAuthMiddleware**:
  - Verify JWT token
  - Attach user to request
  - Handle token expiry
- [ ] Create **RoleMiddleware**:
  - Check user role before accessing routes
- [ ] Create **PermissionMiddleware**:
  - Check specific permissions
- [ ] Configure middleware groups in `Kernel.php`
- [ ] Test authentication flow:
  - Login flow
  - Token validation
  - Token refresh
  - Logout and token invalidation

---

### **PHASE 3: USER MANAGEMENT SYSTEM** (Week 3-4)

#### Task 3.1: Student Management APIs
- [ ] Create **StudentController**:
  - `index()` - List all students (with pagination, search, filters)
  - `show($id)` - Get student details
  - `store()` - Create new student (admin only)
  - `update($id)` - Update student information
  - `destroy($id)` - Soft delete student
  - `assignRoute()` - Assign student to route
  - `getBookings()` - Get student bookings
  - `getTripHistory()` - Get student trip history
- [ ] Create **StudentRequest** validation classes:
  - StoreStudentRequest
  - UpdateStudentRequest
- [ ] Create **StudentResource** for API responses
- [ ] Implement search and filtering:
  - Search by name, student ID, email
  - Filter by institution, route, status
- [ ] Add pagination support
- [ ] Create **StudentService**:
  - Business logic for student operations
  - Validation and data transformation

#### Task 3.2: Driver Management APIs
- [ ] Create **DriverController**:
  - `index()` - List all drivers
  - `show($id)` - Get driver details
  - `store()` - Create new driver
  - `update($id)` - Update driver information
  - `destroy($id)` - Soft delete driver
  - `assignBus()` - Assign bus to driver
  - `assignRoute()` - Assign route to driver
  - `getTripHistory()` - Get driver trip history
  - `getPerformanceMetrics()` - Get driver performance
- [ ] Create **DriverRequest** validation classes
- [ ] Create **DriverResource** for API responses
- [ ] Implement driver-specific logic:
  - License validation
  - Bus assignment validation
  - Route assignment validation
- [ ] Create **DriverService**:
  - Business logic for driver operations

#### Task 3.3: Admin User Management APIs
- [ ] Create **AdminController**:
  - `index()` - List all admins
  - `show($id)` - Get admin details
  - `store()` - Create new admin
  - `update($id)` - Update admin
  - `destroy($id)` - Soft delete admin
  - `assignRole()` - Assign role to admin
  - `updatePermissions()` - Update admin permissions
- [ ] Create **AdminRequest** validation classes
- [ ] Implement admin role hierarchy:
  - Super Admin > Admin > Manager > Viewer
- [ ] Create **AdminService**:
  - Role and permission management logic

---

### **PHASE 4: BUS MANAGEMENT SYSTEM** (Week 4-5)

#### Task 4.1: Bus CRUD APIs
- [ ] Create **BusController**:
  - `index()` - List all buses (with filters: status, route, driver)
  - `show($id)` - Get bus details
  - `store()` - Create new bus
  - `update($id)` - Update bus information
  - `destroy($id)` - Soft delete bus
  - `getLocation($id)` - Get current bus location
  - `getHistory($id)` - Get bus location history
- [ ] Create **BusRequest** validation classes:
  - StoreBusRequest
  - UpdateBusRequest
- [ ] Create **BusResource** for API responses
- [ ] Implement bus status management:
  - Active, Inactive, Maintenance, Emergency
  - Status change validation
  - Status change history
- [ ] Create **BusService**:
  - Business logic for bus operations
  - Status management
  - Route assignment validation

#### Task 4.2: Bus Location Tracking
- [ ] Create **LocationController**:
  - `updateLocation()` - Update bus location (from driver app)
  - `batchUpdate()` - Batch location updates
  - `getCurrentLocation($busId)` - Get current location
  - `getLocationHistory($busId)` - Get location history
- [ ] Create **LocationRequest** validation:
  - Validate coordinates
  - Validate accuracy
  - Validate timestamps
- [ ] Implement location storage:
  - Store location in database
  - Store in Redis for fast access
  - Clean old location data (cron job)
- [ ] Create **LocationService**:
  - Location validation logic
  - Distance calculations
  - Route deviation detection
- [ ] Implement location caching:
  - Cache current locations in Redis
  - TTL for location data
  - Invalidate cache on update

---

### **PHASE 5: REAL-TIME WEBSOCKET SYSTEM** (Week 5-6) ⚠️ CRITICAL

#### Task 5.1: WebSocket Server Setup
- [ ] Install and configure Laravel Echo Server or Pusher
- [ ] Set up Redis for broadcasting
- [ ] Configure broadcasting driver in `.env`
- [ ] Set up broadcasting routes in `routes/channels.php`
- [ ] Configure CORS for WebSocket connections
- [ ] Test WebSocket connection

#### Task 5.2: Broadcast Events
- [ ] Create **BusLocationUpdated** event:
  - Broadcast bus location updates
  - Channel: `bus.{busId}.location`
  - Include location data and bus info
- [ ] Create **RouteDeviation** event:
  - Broadcast route deviation alerts
  - Channel: `bus.{busId}.deviation`
  - Include deviation details
- [ ] Create **UserNotification** event:
  - Broadcast user-specific notifications
  - Channel: `user.{userId}.notifications`
  - Include notification data
- [ ] Create **TripStarted** event:
  - Broadcast trip start
  - Channel: `driver.{driverId}.trips`
- [ ] Create **TripEnded** event:
  - Broadcast trip end
  - Channel: `driver.{driverId}.trips`
- [ ] Create **AdminDashboardUpdate** event:
  - Broadcast dashboard metrics
  - Channel: `admin.dashboard`

#### Task 5.3: WebSocket Channels & Authorization
- [ ] Configure private channels:
  - `bus.{busId}.location` - Authenticated users can subscribe
  - `user.{userId}.notifications` - Only that user can subscribe
  - `driver.{driverId}.messages` - Only that driver can subscribe
- [ ] Create channel authorization logic:
  - Check user authentication
  - Verify user permissions
  - Return true/false for channel access
- [ ] Implement presence channels:
  - Track online users
  - Track active buses
  - Track active drivers
- [ ] Test WebSocket functionality:
  - Connection establishment
  - Message broadcasting
  - Channel authorization
  - Error handling

#### Task 5.4: Real-time Location Broadcasting
- [ ] Create **LocationBroadcastService**:
  - Broadcast location updates in real-time
  - Handle batch location updates
  - Optimize broadcast frequency
- [ ] Implement location update flow:
  - Receive location from driver app
  - Store in database
  - Cache in Redis
  - Broadcast to WebSocket channel
- [ ] Add rate limiting for location updates
- [ ] Implement location filtering:
  - Only broadcast if location changed significantly
  - Filter inaccurate locations

---

### **PHASE 6: NOTIFICATION SYSTEM** (Week 6-7)

#### Task 6.1: Notification Service
- [ ] Create **Notification** model and migration:
  - id, user_id, type, title, message
  - read, read_at, data (JSON)
  - timestamps
- [ ] Create **NotificationController**:
  - `index()` - Get user notifications
  - `markAsRead($id)` - Mark notification as read
  - `markAllAsRead()` - Mark all as read
  - `getUnreadCount()` - Get unread count
- [ ] Create **NotificationService**:
  - Create notifications
  - Send notifications (email, SMS, push)
  - Broadcast real-time notifications
- [ ] Implement notification types:
  - Route deviation alerts
  - Bus delay notifications
  - Seat availability alerts
  - Stop arrival reminders
  - Safety alerts
  - Emergency alerts

#### Task 6.2: Push Notification Integration
- [ ] Integrate Firebase Cloud Messaging (FCM):
  - Install Firebase Admin SDK
  - Configure FCM credentials
  - Create FCM service class
- [ ] Implement push notification sending:
  - Send to single device
  - Send to multiple devices
  - Send to topic (e.g., all students on route)
- [ ] Store device tokens:
  - Create migration for device_tokens table
  - Register device tokens from apps
  - Update tokens on app update
- [ ] Create notification scheduling:
  - Schedule stop arrival reminders
  - Schedule delay notifications

---

### **PHASE 7: VALIDATION & API SECURITY** (Week 7-8)

#### Task 7.1: Request Validation
- [ ] Create comprehensive Form Request classes:
  - LoginRequest
  - RegisterRequest
  - BusRequest
  - RouteRequest
  - LocationRequest
  - BookingRequest
- [ ] Implement custom validation rules:
  - Coordinate validation
  - Phone number validation
  - Student ID format validation
  - License plate validation
- [ ] Create validation error responses
- [ ] Test all validation scenarios

#### Task 7.2: API Security
- [ ] Implement rate limiting:
  - Different limits for different endpoints
  - Strict limits for authentication
  - Per-user rate limiting
- [ ] Add CORS configuration:
  - Allow specific origins
  - Configure headers
  - Handle preflight requests
- [ ] Implement API versioning:
  - URL-based versioning (/api/v1/)
  - Version in headers (optional)
- [ ] Add request logging:
  - Log all API requests
  - Log errors
  - Log suspicious activities
- [ ] Implement input sanitization:
  - Sanitize all user inputs
  - Prevent XSS attacks
  - SQL injection prevention (Eloquent)

#### Task 7.3: Error Handling
- [ ] Create custom exception handlers:
  - ApiException
  - ValidationException
  - AuthenticationException
  - AuthorizationException
- [ ] Create error response format:
  - Consistent error structure
  - Error codes
  - Error messages
- [ ] Implement error logging:
  - Log errors to file
  - Send critical errors to email/logging service
- [ ] Create error documentation

---

### **PHASE 8: TESTING & DOCUMENTATION** (Week 8-9)

#### Task 8.1: Unit Testing
- [ ] Write tests for models:
  - Model relationships
  - Model methods
  - Model scopes
- [ ] Write tests for services:
  - Service methods
  - Business logic
  - Edge cases
- [ ] Write tests for controllers:
  - API endpoints
  - Request validation
  - Response format

#### Task 8.2: Integration Testing
- [ ] Test authentication flow:
  - Login, logout, token refresh
  - Registration
  - Password reset
- [ ] Test CRUD operations:
  - Bus CRUD
  - Route CRUD
  - User CRUD
- [ ] Test WebSocket broadcasting:
  - Event broadcasting
  - Channel authorization
- [ ] Test location tracking:
  - Location updates
  - Location broadcasting

#### Task 8.3: API Documentation
- [ ] Document all API endpoints:
  - Request/response formats
  - Authentication requirements
  - Error responses
  - Example requests
- [ ] Create Postman collection
- [ ] Update OpenAPI/Swagger documentation
- [ ] Create API usage guide
- [ ] Document WebSocket channels

---

### **PHASE 9: PERFORMANCE OPTIMIZATION** (Week 9-10)

#### Task 9.1: Database Optimization
- [ ] Optimize database queries:
  - Use eager loading (with())
  - Add missing indexes
  - Optimize slow queries
- [ ] Implement query caching:
  - Cache frequent queries
  - Cache route data
  - Cache user permissions
- [ ] Database connection pooling
- [ ] Archive old location data

#### Task 9.2: Caching Strategy
- [ ] Implement Redis caching:
  - Cache bus locations
  - Cache route data
  - Cache user data
  - Cache permissions
- [ ] Configure cache tags
- [ ] Implement cache invalidation:
  - Invalidate on updates
  - TTL for cache entries
- [ ] Monitor cache hit rates

#### Task 9.3: API Response Optimization
- [ ] Implement API resources:
  - Transform responses
  - Include/exclude fields
  - Reduce payload size
- [ ] Add pagination to all list endpoints
- [ ] Implement response compression
- [ ] Optimize JSON serialization

---

## 🔗 API ENDPOINTS TO IMPLEMENT

### Authentication
- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `POST /api/auth/logout` ✅
- `GET /api/auth/me` ✅
- `POST /api/auth/forgot-password` ✅
- `POST /api/auth/reset-password` ✅

### Student Management
- `GET /api/admin/students` ✅
- `GET /api/admin/students/{id}` ✅
- `POST /api/admin/students` ✅
- `PUT /api/admin/students/{id}` ✅
- `DELETE /api/admin/students/{id}` ✅

### Driver Management
- `POST /api/driver/login` ✅
- `GET /api/driver/me` ✅
- `POST /api/driver/refresh-token` ✅
- `GET /api/admin/drivers` ✅
- `GET /api/admin/drivers/{id}` ✅
- `POST /api/admin/drivers` ✅
- `PUT /api/admin/drivers/{id}` ✅
- `DELETE /api/admin/drivers/{id}` ✅

### Bus Management
- `GET /api/admin/buses` ✅
- `GET /api/admin/buses/{id}` ✅
- `POST /api/admin/buses` ✅
- `PUT /api/admin/buses/{id}` ✅
- `DELETE /api/admin/buses/{id}` ✅
- `GET /api/admin/buses/{id}/location` ✅
- `GET /api/admin/buses/{id}/history` ✅
- `GET /api/buses` (for students) ✅
- `GET /api/buses/{id}` (for students) ✅
- `GET /api/buses/{id}/location` (for students) ✅

### WebSocket Channels
- `bus.{busId}.location` ✅
- `user.{userId}.notifications` ✅
- `driver.{driverId}.messages` ✅
- `admin.dashboard` ✅

---

## 📦 DELIVERABLES

1. **Complete Laravel Backend Application**
   - All API endpoints implemented
   - Database migrations
   - Models and relationships
   - Authentication system
   - WebSocket server

2. **Documentation**
   - API documentation (updated OpenAPI)
   - Database schema documentation
   - Setup guide
   - Deployment guide

3. **Testing**
   - Unit tests
   - Integration tests
   - Test coverage report

4. **Security**
   - Security audit report
   - Penetration testing results

---

## ✅ QUALITY CHECKLIST

- [ ] All authentication endpoints working
- [ ] Role-based access control implemented
- [ ] All CRUD operations tested
- [ ] WebSocket broadcasting working
- [ ] Location tracking functional
- [ ] Notification system working
- [ ] Security measures implemented
- [ ] Performance optimized
- [ ] Error handling comprehensive
- [ ] API documentation complete
- [ ] Tests passing
- [ ] Ready for production

---

## 🚀 SUCCESS CRITERIA

Your work will be considered successful when:
1. All authentication flows work correctly
2. Users can manage buses, routes, and users
3. Real-time location tracking works via WebSocket
4. Notification system delivers alerts reliably
5. API is secure and performant
6. All endpoints are documented and tested
7. Backend is production-ready

---

**Good luck with the backend development! The entire system depends on your robust API foundation. 🚀**

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Project: TRACKSY - Smart Student Transport Tracking System*

