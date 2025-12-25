<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Student\StudentController;
use App\Http\Controllers\Driver\DriverController;
use App\Http\Controllers\Driver\TripController;
use App\Http\Controllers\Driver\LocationController;
use App\Http\Controllers\Driver\EmergencyController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BusController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\StopController;
use App\Http\Controllers\Admin\LocationDataController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AlertController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BusController as ApiBusController;
use App\Http\Controllers\Api\RouteController as ApiRouteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Root API endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'Tracksy API',
        'version' => '1.0.0',
        'status' => 'running',
    ]);
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'reset']);
    
    Route::middleware(\App\Http\Middleware\ApiAuth::class)->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ============================================
// DRIVER ROUTES
// ============================================
Route::prefix('driver')->group(function () {
    Route::post('/login', [DriverController::class, 'login']);
    Route::post('/signup', [DriverController::class, 'signup']); // Public driver signup
    
    Route::middleware(\App\Http\Middleware\ApiAuth::class)->group(function () {
        Route::get('/me', [DriverController::class, 'me']);
        Route::post('/logout', [DriverController::class, 'logout']);
        Route::post('/refresh-token', [DriverController::class, 'refreshToken']);
        Route::put('/profile', [DriverController::class, 'updateProfile']);
        Route::post('/change-password', [DriverController::class, 'changePassword']);
        
        // Location routes
        Route::post('/location', [LocationController::class, 'update']);
        Route::post('/location/batch', [LocationController::class, 'batchUpdate']);
        
        // Bus route
        Route::get('/bus', [DriverController::class, 'getBus']);
        
        // Route routes
        Route::get('/route', [DriverController::class, 'getRoute']);
        Route::get('/route/stops', [DriverController::class, 'getRouteStops']);
        Route::post('/stops/{id}/arrive', [DriverController::class, 'markStopArrival']);
        
        // Trip routes
        Route::post('/trips/start', [TripController::class, 'start']);
        Route::post('/trips/{id}/end', [TripController::class, 'end']);
        Route::get('/trips/current', [TripController::class, 'getCurrent']);
        Route::get('/trips', [TripController::class, 'index']);
        Route::get('/trips/{id}', [TripController::class, 'show']);
        
        // Passenger routes
        Route::get('/trips/{id}/passengers', [DriverController::class, 'getPassengers']);
        Route::post('/passengers/check-in', [DriverController::class, 'checkIn']);
        
        // Emergency routes
        Route::post('/emergency', [EmergencyController::class, 'sendEmergency']);
        Route::post('/incidents', [EmergencyController::class, 'reportIncident']);
        
        // Notification routes
        Route::get('/notifications', [\App\Http\Controllers\Driver\NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [\App\Http\Controllers\Driver\NotificationController::class, 'getUnreadCount']);
        Route::get('/notifications/{id}', [\App\Http\Controllers\Driver\NotificationController::class, 'show']);
        Route::put('/notifications/{id}/read', [\App\Http\Controllers\Driver\NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [\App\Http\Controllers\Driver\NotificationController::class, 'markAllAsRead']);
    });
});

// ============================================
// STUDENT ROUTES (Public API)
// ============================================
Route::prefix('buses')->middleware([\App\Http\Middleware\ApiAuth::class, \App\Http\Middleware\CheckFeePayment::class])->group(function () {
    Route::get('/', [ApiBusController::class, 'index']);
    Route::get('/{id}', [ApiBusController::class, 'show']);
    Route::get('/{id}/location', [ApiBusController::class, 'getLocation']);
    Route::get('/{id}/seats', [ApiBusController::class, 'getSeatAvailability']);
});

Route::prefix('routes')->middleware([\App\Http\Middleware\ApiAuth::class, \App\Http\Middleware\CheckFeePayment::class])->group(function () {
    Route::get('/', [ApiRouteController::class, 'index']);
    Route::get('/{id}', [ApiRouteController::class, 'show']);
    Route::get('/{id}/stops', [ApiRouteController::class, 'getStops']);
});

Route::prefix('bookings')->middleware([\App\Http\Middleware\ApiAuth::class, \App\Http\Middleware\CheckFeePayment::class])->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('/statistics', [BookingController::class, 'getStatistics']);
    Route::get('/monthly-summary', [BookingController::class, 'getMonthlySummary']);
    Route::get('/usage-statistics', [BookingController::class, 'getUsageStatistics']);
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::delete('/{id}', [BookingController::class, 'destroy']);
});

// ============================================
// ADMIN ROUTES
// ============================================
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
    Route::post('/signup', [AdminController::class, 'signup']);
    
    // Location data (countries, states, cities, universities) - Public access (reference data)
    Route::prefix('locations')->group(function () {
        Route::get('/countries', [LocationDataController::class, 'getCountries']);
        Route::get('/states/{countryId?}', [LocationDataController::class, 'getStates']);
        Route::get('/cities/{stateId?}', [LocationDataController::class, 'getCities']);
        Route::get('/universities', [LocationDataController::class, 'getUniversities']); // Query params: country, state, city
        Route::get('/universities/by-location', [LocationDataController::class, 'getUniversitiesByCountryAndState']); // Alternative endpoint
        Route::get('/search', [LocationDataController::class, 'search']);
    });
    
    Route::middleware([\App\Http\Middleware\ApiAuth::class, \App\Http\Middleware\RoleMiddleware::class . ':admin|manager'])->group(function () {
        Route::get('/me', [AdminController::class, 'me']);
        Route::post('/refresh-token', [AdminController::class, 'refreshToken']);
        
        // Bus management
        Route::apiResource('buses', BusController::class);
        // Specific bus routes for view, edit, delete
        Route::get('/buses/{id}/view', [BusController::class, 'show']);
        Route::put('/buses/{id}/edit', [BusController::class, 'update']);
        Route::patch('/buses/{id}/edit', [BusController::class, 'update']);
        Route::delete('/buses/{id}/delete', [BusController::class, 'destroy']);
        Route::get('/buses/{id}/location', [BusController::class, 'getLocation']);
        Route::get('/buses/{id}/history', [BusController::class, 'getHistory']);
        Route::patch('/buses/{id}/status', [BusController::class, 'updateStatus']);
        Route::get('/buses/{id}/location-history', [BusController::class, 'getLocationHistory']);
        Route::get('/buses/{id}/trips', [BusController::class, 'getTrips']);
        
        // Route management
        Route::apiResource('routes', RouteController::class);
        Route::get('/routes/{id}/stops', [RouteController::class, 'getStops']);
        
        // Stop management
        Route::apiResource('stops', StopController::class);
        
        // User management
        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{id}', [StudentController::class, 'show']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{id}', [StudentController::class, 'update']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);
        
        Route::get('/drivers', [DriverController::class, 'index']);
        Route::get('/drivers/{id}', [DriverController::class, 'show']);
        Route::post('/drivers', [DriverController::class, 'store']);
        Route::put('/drivers/{id}', [DriverController::class, 'update']);
        Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);
        
        Route::get('/admins', [AdminController::class, 'index']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        
        // Analytics
        Route::get('/analytics/overview', [AnalyticsController::class, 'getOverview']);
        Route::get('/analytics/usage', [AnalyticsController::class, 'getUsageStatistics']);
        Route::get('/analytics/performance', [AnalyticsController::class, 'getPerformanceMetrics']);
        
        // Reports
        Route::get('/reports/generate', [ReportController::class, 'generate']);
        Route::get('/reports/export', [ReportController::class, 'export']);
        
        // Alerts
        Route::get('/alerts', [AlertController::class, 'index']);
        Route::post('/alerts', [AlertController::class, 'store']);
        Route::put('/alerts/{id}/acknowledge', [AlertController::class, 'acknowledge']);
        Route::put('/alerts/{id}/resolve', [AlertController::class, 'resolve']);
        
        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::get('/notifications/{id}', [NotificationController::class, 'show']);
        Route::post('/notifications/{id}/send', [NotificationController::class, 'send']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        
        // Settings
        Route::get('/settings/system', [SettingsController::class, 'getSystemSettings']);
        Route::put('/settings/system', [SettingsController::class, 'updateSystemSettings']);
        Route::get('/settings/notifications', [SettingsController::class, 'getNotificationSettings']);
        Route::put('/settings/notifications', [SettingsController::class, 'updateNotificationSettings']);
        Route::get('/settings/map', [SettingsController::class, 'getMapSettings']);
        Route::put('/settings/map', [SettingsController::class, 'updateMapSettings']);
        Route::get('/settings/security', [SettingsController::class, 'getSecuritySettings']);
        Route::put('/settings/security', [SettingsController::class, 'updateSecuritySettings']);
        Route::get('/settings/integrations', [SettingsController::class, 'getIntegrationSettings']);
        Route::put('/settings/integrations', [SettingsController::class, 'updateIntegrationSettings']);
        Route::post('/settings/upload-logo', [SettingsController::class, 'uploadLogo']);
        
        // Fee Management (Admin)
        Route::prefix('fees')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\FeeController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Admin\FeeController::class, 'store']);
            Route::post('/bulk', [\App\Http\Controllers\Admin\FeeController::class, 'createBulkFees']);
            Route::get('/statistics', [\App\Http\Controllers\Admin\FeeController::class, 'getStatistics']);
            Route::get('/export', [\App\Http\Controllers\Admin\FeeController::class, 'exportReport']);
            Route::put('/update-overdue', [\App\Http\Controllers\Admin\FeeController::class, 'updateOverdueFees']);
            Route::get('/{id}', [\App\Http\Controllers\Admin\FeeController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Admin\FeeController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Admin\FeeController::class, 'destroy']);
            Route::post('/{id}/generate-invoice', [\App\Http\Controllers\Admin\FeeController::class, 'generateInvoice']);
            Route::post('/generate-bulk-invoices', [\App\Http\Controllers\Admin\FeeController::class, 'generateBulkInvoices']);
            Route::put('/{id}/due-date', [\App\Http\Controllers\Admin\FeeController::class, 'updateDueDate']);
            Route::post('/{id}/record-payment', [\App\Http\Controllers\Admin\FeeController::class, 'recordPayment']);
        });
    });
});


// Student Fee Management Routes
Route::middleware([\App\Http\Middleware\ApiAuth::class])->prefix('student')->group(function () {
    Route::get('/fees', [App\Http\Controllers\Student\FeeController::class, 'index']);
    Route::get('/fees/statistics', [App\Http\Controllers\Student\FeeController::class, 'getStatistics']);
    Route::get('/fees/payment-history', [App\Http\Controllers\Student\FeeController::class, 'getPaymentHistory']);
    Route::get('/fees/{id}', [App\Http\Controllers\Student\FeeController::class, 'show']);
    Route::post('/fees/{id}/pay', [App\Http\Controllers\Student\FeeController::class, 'makePayment']);
    Route::get('/fees/{id}/invoice', [App\Http\Controllers\Student\FeeController::class, 'downloadInvoice']);
    Route::get('/payments/{id}/receipt', [App\Http\Controllers\Student\FeeController::class, 'downloadReceipt']);
});
