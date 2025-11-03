# TASK ASSIGNMENT DOCUMENT
## Backend API Development (Laravel) - Part 2

**Assigned to:** Duria (SU92-BITFM-F24-003)  
**Component:** Laravel Backend API - Business Logic & Advanced Features  
**Technology Stack:** Laravel 10+, MySQL, Redis, Pusher/Socket.io, JWT

---

## 📋 PROJECT OVERVIEW

You are responsible for developing **Business Logic Services** including route management, booking system, trip management, analytics, reporting, and integration services. You'll work on the complex business workflows that power the Tracksy system.

---

## 🎯 CORE OBJECTIVES

1. Route and stop management system
2. Booking and seat reservation system
3. Trip management and tracking
4. Analytics and reporting engine
5. Alert and notification management
6. Integration services (SMS, Email)
7. Advanced features and optimizations

---

## 🔧 PHASE-BY-PHASE TASK BREAKDOWN

### **PHASE 1: ROUTE & STOP MANAGEMENT SYSTEM** (Week 1-2)

#### Task 1.1: Route CRUD APIs
- [ ] Create **RouteController**:
  - `index()` - List all routes (with pagination, search, filters)
  - `show($id)` - Get route details with stops
  - `store()` - Create new route
  - `update($id)` - Update route information
  - `destroy($id)` - Soft delete route
  - `getStops($id)` - Get all stops for route
  - `getStatistics($id)` - Get route statistics
- [ ] Create **RouteRequest** validation classes:
  - StoreRouteRequest
  - UpdateRouteRequest
  - Validate route name uniqueness
  - Validate stop order
- [ ] Create **RouteResource** for API responses
- [ ] Implement route creation logic:
  - Create route
  - Attach stops with order
  - Calculate distance (using coordinates)
  - Calculate estimated duration
  - Create route-stop relationships
- [ ] Create **RouteService**:
  - Business logic for route operations
  - Distance calculation (Haversine formula)
  - Duration estimation
  - Route optimization logic

#### Task 1.2: Stop Management APIs
- [ ] Create **StopController**:
  - `index()` - List all stops
  - `show($id)` - Get stop details
  - `store()` - Create new stop
  - `update($id)` - Update stop information
  - `destroy($id)` - Delete stop
  - `getRoutes($id)` - Get routes passing through stop
  - `getStatistics($id)` - Get stop statistics
- [ ] Create **StopRequest** validation:
  - Validate coordinates
  - Validate address
  - Validate name uniqueness
- [ ] Create **StopResource** for API responses
- [ ] Implement stop creation:
  - Validate coordinates
  - Geocode address if needed
  - Create stop
  - Attach to routes
- [ ] Create **StopService**:
  - Business logic for stops
  - Nearby stops calculation
  - Stop statistics

#### Task 1.3: Route-Stop Relationship Management
- [ ] Implement route-stop pivot table operations:
  - Add stop to route
  - Remove stop from route
  - Reorder stops in route
  - Update estimated times
- [ ] Create **RouteStopService**:
  - Manage route-stop relationships
  - Calculate stop order
  - Update timing between stops
- [ ] Implement route validation:
  - Ensure at least start and end stops
  - Validate stop order
  - Check for circular routes (optional)

---

### **PHASE 2: BOOKING & SEAT RESERVATION SYSTEM** (Week 2-3)

#### Task 2.1: Booking System Database
- [ ] Create migration for **bookings** table:
  - id, student_id, bus_id, trip_id (nullable)
  - seat_number, trip_date
  - status (enum: pending, confirmed, cancelled, completed)
  - booking_reference (unique)
  - cancelled_at, cancelled_by
  - timestamps, soft_deletes
- [ ] Create migration for **seat_assignments** table:
  - id, booking_id, bus_id, seat_number
  - trip_date, status
  - timestamps
- [ ] Create **Booking** model:
  - Relationships: student, bus, trip
  - Status methods
  - Cancellation logic
- [ ] Create **SeatAssignment** model:
  - Relationships: booking, bus
  - Seat availability checking

#### Task 2.2: Booking APIs
- [ ] Create **BookingController**:
  - `index()` - Get user bookings (for students)
  - `show($id)` - Get booking details
  - `store()` - Create new booking
  - `update($id)` - Update booking
  - `destroy($id)` - Cancel booking
  - `getBookingHistory()` - Get booking history
- [ ] Create **BookingRequest** validation:
  - Validate seat availability
  - Validate bus availability
  - Validate date
  - Check conflicts
- [ ] Create **BookingResource** for API responses
- [ ] Implement booking creation logic:
  - Check seat availability
  - Create booking
  - Assign seat
  - Generate booking reference
  - Send confirmation notification
- [ ] Create **BookingService**:
  - Seat availability checking
  - Booking creation logic
  - Booking cancellation logic
  - Booking conflict detection

#### Task 2.3: Seat Availability System
- [ ] Create **SeatAvailabilityService**:
  - Check seat availability for bus/date
  - Get seat map
  - Calculate available seats
  - Reserve seat temporarily
- [ ] Implement seat availability API:
  - `GET /api/buses/{id}/seats` - Get seat availability
  - Include seat map with statuses
  - Filter by date
- [ ] Create seat locking mechanism:
  - Lock seat during booking process
  - Release lock after timeout
  - Prevent double booking
- [ ] Implement seat status:
  - Available (green)
  - Occupied (red)
  - Reserved (yellow)
  - Selected (blue - temporary)

---

### **PHASE 3: TRIP MANAGEMENT SYSTEM** (Week 3-4)

#### Task 3.1: Trip Database & Models
- [ ] Create migration for **trips** table:
  - id, driver_id, bus_id, route_id
  - start_time, end_time
  - start_location, end_location (JSON)
  - status (enum: not_started, in_progress, completed, cancelled)
  - distance, duration
  - passenger_count
  - timestamps
- [ ] Create migration for **trip_stops** table:
  - id, trip_id, stop_id
  - scheduled_time, actual_time
  - passengers_boarding, passengers_alighting
  - timestamps
- [ ] Create **Trip** model:
  - Relationships: driver, bus, route, stops, passengers
  - Status methods
  - Duration calculation
- [ ] Create **TripStop** model:
  - Relationships: trip, stop
  - Timing calculations

#### Task 3.2: Trip Management APIs
- [ ] Create **TripController** (for drivers):
  - `startTrip()` - Start a new trip
  - `endTrip($id)` - End a trip
  - `getCurrentTrip()` - Get current active trip
  - `getTripHistory()` - Get trip history
  - `getTripDetails($id)` - Get trip details
- [ ] Create **TripRequest** validation:
  - Validate trip start
  - Validate trip end
  - Check driver permissions
- [ ] Create **TripResource** for API responses
- [ ] Implement trip start logic:
  - Validate driver and bus
  - Create trip record
  - Initialize location tracking
  - Broadcast trip started event
  - Send notifications
- [ ] Implement trip end logic:
  - Calculate trip statistics
  - Update trip status
  - Store final location
  - Broadcast trip ended event
  - Generate trip report
- [ ] Create **TripService**:
  - Trip creation logic
  - Trip statistics calculation
  - Trip completion logic
  - Trip history management

#### Task 3.3: Trip Stop Management
- [ ] Create **TripStopController**:
  - `markArrival($tripId, $stopId)` - Mark stop arrival
  - `getStops($tripId)` - Get trip stops
- [ ] Implement stop arrival logic:
  - Record arrival time
  - Calculate delay
  - Check-in passengers (if applicable)
  - Send notifications
  - Broadcast stop arrival
- [ ] Create **TripStopService**:
  - Stop arrival management
  - Passenger check-in logic
  - Timing calculations

---

### **PHASE 4: PASSENGER & CHECK-IN SYSTEM** (Week 4-5)

#### Task 4.1: Passenger Management
- [ ] Create migration for **trip_passengers** table:
  - id, trip_id, student_id, booking_id
  - boarding_stop_id, alighting_stop_id
  - seat_number
  - checked_in, checked_in_at
  - boarded, boarded_at
  - alighted, alighted_at
  - timestamps
- [ ] Create **TripPassenger** model:
  - Relationships: trip, student, booking
  - Check-in status
- [ ] Create **PassengerController**:
  - `getPassengers($tripId)` - Get trip passengers
  - `checkIn()` - Check-in passenger
  - `getPassengerStats($tripId)` - Get passenger statistics
- [ ] Create **PassengerService**:
  - Passenger management
  - Check-in logic
  - Automatic check-in (geofencing)
  - Seat assignment

#### Task 4.2: Check-in System
- [ ] Implement manual check-in:
  - QR code scanning
  - Student ID input
  - Validation
  - Record check-in
  - Assign seat if needed
- [ ] Implement automatic check-in:
  - Geofencing for stops
  - Detect bus arrival at stop
  - Auto-check-in passengers
  - Send notifications
- [ ] Create check-in API endpoints:
  - `POST /api/driver/passengers/check-in` - Manual check-in
  - `GET /api/driver/trips/{id}/passengers` - Get passengers
- [ ] Implement check-in validation:
  - Verify student is on trip
  - Verify correct stop
  - Prevent duplicate check-ins

---

### **PHASE 5: ANALYTICS & REPORTING ENGINE** (Week 5-6)

#### Task 5.1: Analytics Service
- [ ] Create **AnalyticsController**:
  - `getOverview()` - Get dashboard overview
  - `getUsageStatistics()` - Get usage stats
  - `getPerformanceMetrics()` - Get performance metrics
  - `getRouteAnalytics($routeId)` - Get route analytics
  - `getBusAnalytics($busId)` - Get bus analytics
- [ ] Create **AnalyticsService**:
  - Calculate metrics
  - Generate statistics
  - Performance calculations
  - Trend analysis
- [ ] Implement dashboard metrics:
  - Total active buses
  - Total students
  - Total routes
  - On-time percentage
  - Current alerts
  - System health

#### Task 5.2: Usage Statistics
- [ ] Implement daily/weekly/monthly statistics:
  - Trip counts by period
  - Peak hours analysis
  - Route popularity
  - Bus utilization rates
  - Student usage patterns
- [ ] Create statistical calculations:
  - Average wait times
  - Average trip duration
  - On-time performance
  - Capacity utilization
- [ ] Create analytics queries:
  - Optimize database queries
  - Use aggregations
  - Cache results

#### Task 5.3: Reporting System
- [ ] Create **ReportController**:
  - `generateDailyReport()` - Generate daily report
  - `generateWeeklyReport()` - Generate weekly report
  - `generateMonthlyReport()` - Generate monthly report
  - `generateCustomReport()` - Generate custom report
  - `exportReport()` - Export report (PDF, Excel)
- [ ] Create **ReportService**:
  - Report generation logic
  - Data aggregation
  - Report formatting
  - Export functionality
- [ ] Implement report types:
  - Daily operations report
  - Weekly summary
  - Monthly comprehensive
  - Custom date range
  - Performance reports
- [ ] Create report templates:
  - PDF templates
  - Excel templates
  - Email templates

---

### **PHASE 6: ALERT & NOTIFICATION MANAGEMENT** (Week 6-7)

#### Task 6.1: Alert System
- [ ] Create migration for **alerts** table:
  - id, type, severity
  - title, message, data (JSON)
  - bus_id, route_id, driver_id (nullable)
  - status (enum: new, acknowledged, resolved)
  - acknowledged_at, resolved_at
  - timestamps
- [ ] Create **Alert** model:
  - Relationships: bus, route, driver
  - Status methods
- [ ] Create **AlertController**:
  - `index()` - List all alerts (with filters)
  - `show($id)` - Get alert details
  - `acknowledge($id)` - Acknowledge alert
  - `resolve($id)` - Resolve alert
  - `create()` - Create alert
- [ ] Implement alert types:
  - Route deviation
  - Bus delay
  - Emergency situation
  - Maintenance alert
  - System error
- [ ] Create **AlertService**:
  - Alert creation logic
  - Alert routing
  - Alert escalation
  - Alert history

#### Task 6.2: Route Deviation Detection
- [ ] Create **RouteDeviationService**:
  - Calculate if bus is off-route
  - Compare current location to route
  - Calculate deviation distance
  - Detect significant deviations
- [ ] Implement deviation detection:
  - Real-time location monitoring
  - Route comparison algorithm
  - Deviation threshold
  - Alert generation
- [ ] Create deviation alerts:
  - Auto-create alerts on deviation
  - Send to admin
  - Send to driver
  - Send to affected students

#### Task 6.3: Notification Management
- [ ] Create **NotificationController** (admin):
  - `sendToAll()` - Send to all students
  - `sendToRoute()` - Send to route students
  - `sendToDriver()` - Send to driver
  - `sendCustom()` - Send custom notification
  - `getTemplates()` - Get notification templates
- [ ] Create **NotificationTemplate** model:
  - Store email/SMS templates
  - Template variables
- [ ] Implement notification sending:
  - Email notifications
  - SMS notifications
  - Push notifications
  - In-app notifications
- [ ] Create **NotificationService**:
  - Notification delivery
  - Template rendering
  - Delivery tracking
  - Failure handling

---

### **PHASE 7: INTEGRATION SERVICES** (Week 7-8)

#### Task 7.1: Email Service Integration
- [ ] Configure Laravel Mail:
  - SMTP configuration
  - Mail driver setup
- [ ] Create email templates:
  - Welcome email
  - Password reset email
  - Booking confirmation
  - Trip reminder
  - Alert notifications
- [ ] Create **EmailService**:
  - Send emails
  - Template rendering
  - Email queue management
  - Delivery tracking
- [ ] Implement email notifications:
  - Registration confirmation
  - Booking confirmations
  - Trip reminders
  - Route changes
  - Emergency alerts

#### Task 7.2: SMS Service Integration
- [ ] Integrate SMS provider (Twilio, Nexmo, etc.):
  - Configure SMS credentials
  - Create SMS service class
- [ ] Create **SMSService**:
  - Send SMS
  - SMS templates
  - Delivery tracking
  - Error handling
- [ ] Implement SMS notifications:
  - Emergency alerts
  - Critical updates
  - OTP verification
- [ ] Create SMS templates:
  - Alert templates
  - Notification templates

#### Task 7.3: External API Integrations
- [ ] Integrate mapping service (Google Maps/Mapbox):
  - Geocoding addresses
  - Route optimization
  - Distance calculations
  - Directions API
- [ ] Create **MapService**:
  - Geocoding
  - Reverse geocoding
  - Route optimization
  - Distance calculations
- [ ] Implement payment gateway (if needed):
  - Payment processing
  - Refund handling
  - Payment verification

---

### **PHASE 8: ADVANCED FEATURES** (Week 8-9)

#### Task 8.1: Emergency & Incident Management
- [ ] Create **EmergencyController**:
  - `sendEmergency()` - Send emergency alert
  - `getEmergencies()` - Get emergency list
  - `resolveEmergency($id)` - Resolve emergency
- [ ] Create **IncidentController**:
  - `reportIncident()` - Report incident
  - `getIncidents()` - Get incidents
  - `updateIncident($id)` - Update incident
- [ ] Implement emergency handling:
  - Immediate alert to admin
  - Location sharing
  - Emergency type classification
  - Auto-escalation
- [ ] Create **EmergencyService**:
  - Emergency processing
  - Alert distribution
  - Response tracking

#### Task 8.2: Maintenance Management
- [ ] Create migration for **maintenance** table:
  - id, bus_id
  - type, description
  - scheduled_date, completed_date
  - cost, technician
  - status
  - timestamps
- [ ] Create **MaintenanceController**:
  - `index()` - List maintenance records
  - `store()` - Create maintenance
  - `update($id)` - Update maintenance
  - `getSchedule()` - Get maintenance schedule
- [ ] Create **MaintenanceService**:
  - Schedule management
  - Reminder notifications
  - Cost tracking

#### Task 8.3: Performance Optimization
- [ ] Implement database query optimization:
  - Eager loading
  - Query caching
  - Index optimization
- [ ] Implement API response caching:
  - Cache frequent queries
  - Cache route data
  - Cache analytics
- [ ] Implement background jobs:
  - Email sending (queues)
  - SMS sending (queues)
  - Report generation (queues)
  - Data archiving (scheduled)
- [ ] Create scheduled tasks (cron jobs):
  - Clean old location data
  - Generate daily reports
  - Send scheduled notifications
  - Archive old bookings

---

### **PHASE 9: TESTING & DEPLOYMENT** (Week 9-10)

#### Task 9.1: Feature Testing
- [ ] Test route management:
  - Create, update, delete routes
  - Add/remove stops
  - Route calculations
- [ ] Test booking system:
  - Create bookings
  - Check seat availability
  - Cancel bookings
  - Handle conflicts
- [ ] Test trip management:
  - Start/end trips
  - Stop management
  - Passenger check-in
- [ ] Test analytics:
  - Generate reports
  - Calculate metrics
  - Export functionality

#### Task 9.2: Integration Testing
- [ ] Test email integration
- [ ] Test SMS integration
- [ ] Test push notifications
- [ ] Test WebSocket events
- [ ] Test external API integrations

#### Task 9.3: Documentation
- [ ] Update API documentation:
  - All new endpoints
  - Request/response examples
  - Error codes
- [ ] Create business logic documentation:
  - Workflow diagrams
  - Process documentation
  - Integration guides
- [ ] Create deployment documentation

---

## 🔗 API ENDPOINTS TO IMPLEMENT

### Routes Management
- `GET /api/admin/routes` ✅
- `POST /api/admin/routes` ✅
- `GET /api/admin/routes/{id}` ✅
- `PUT /api/admin/routes/{id}` ✅
- `DELETE /api/admin/routes/{id}` ✅
- `GET /api/admin/routes/{id}/stops` ✅
- `GET /api/routes` (for students) ✅
- `GET /api/routes/{id}` (for students) ✅
- `GET /api/routes/{id}/stops` (for students) ✅
- `GET /api/driver/route` ✅
- `GET /api/driver/route/stops` ✅

### Stops Management
- `GET /api/admin/stops` ✅
- `POST /api/admin/stops` ✅
- `PUT /api/admin/stops/{id}` ✅
- `DELETE /api/admin/stops/{id}` ✅

### Bookings
- `GET /api/bookings` ✅
- `POST /api/bookings` ✅
- `GET /api/bookings/{id}` ✅
- `DELETE /api/bookings/{id}` ✅
- `GET /api/buses/{id}/seats` ✅

### Trips
- `POST /api/driver/trips/start` ✅
- `POST /api/driver/trips/{id}/end` ✅
- `GET /api/driver/trips/current` ✅
- `GET /api/driver/trips` ✅
- `GET /api/driver/trips/{id}` ✅
- `POST /api/driver/stops/{id}/arrive` ✅

### Passengers
- `GET /api/driver/trips/{id}/passengers` ✅
- `POST /api/driver/passengers/check-in` ✅

### Analytics
- `GET /api/admin/analytics/overview` ✅
- `GET /api/admin/analytics/usage` ✅
- `GET /api/admin/analytics/performance` ✅
- `GET /api/admin/reports/generate` ✅

### Alerts & Notifications
- `GET /api/admin/alerts` ✅
- `POST /api/admin/alerts` ✅
- `PUT /api/admin/alerts/{id}/acknowledge` ✅
- `PUT /api/admin/alerts/{id}/resolve` ✅

### Emergency
- `POST /api/driver/emergency` ✅
- `POST /api/driver/incidents` ✅

---

## 📦 DELIVERABLES

1. **Complete Business Logic Services**
   - Route management system
   - Booking system
   - Trip management
   - Analytics engine
   - Alert system

2. **Integration Services**
   - Email service
   - SMS service
   - External APIs

3. **Documentation**
   - API documentation updates
   - Business logic documentation
   - Integration guides

4. **Testing**
   - Feature tests
   - Integration tests
   - Test coverage

---

## ✅ QUALITY CHECKLIST

- [ ] All route management APIs working
- [ ] Booking system fully functional
- [ ] Trip management working
- [ ] Analytics generating accurate reports
- [ ] Alert system detecting issues
- [ ] Email/SMS integrations working
- [ ] All endpoints tested
- [ ] Performance optimized
- [ ] Documentation complete

---

## 🚀 SUCCESS CRITERIA

Your work will be considered successful when:
1. Routes and stops can be managed efficiently
2. Students can book seats seamlessly
3. Drivers can manage trips effectively
4. Analytics provide accurate insights
5. Alerts are generated and delivered properly
6. All integrations work reliably
7. System is performant and scalable

---

## 🔄 COORDINATION WITH IRFAN

You'll work closely with Irfan on:
- Database schema coordination
- API endpoint consistency
- WebSocket event broadcasting
- Authentication and authorization
- Shared services and utilities

---

**Good luck with the business logic development! Your work makes the system intelligent and user-friendly. 🚀**

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Project: TRACKSY - Smart Student Transport Tracking System*

