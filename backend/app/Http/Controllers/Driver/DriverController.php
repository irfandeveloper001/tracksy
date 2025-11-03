<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class DriverController extends Controller
{
    public function login(Request $request)
    {
        // Driver login - same as AuthController but for driver role
        // TODO: Implement driver-specific login
    }

    public function me()
    {
        // Get driver profile
        $driver = auth()->user();
        
        return $this->successResponse([
            'id' => $driver->id,
            'name' => $driver->name,
            'email' => $driver->email,
            'driver_id' => $driver->driver_id,
            'license_number' => $driver->license_number,
            'assigned_bus' => $driver->assignedBus,
            'assigned_route' => $driver->assignedRoute,
            'status' => $driver->status,
        ]);
    }

    public function refreshToken()
    {
        // Refresh JWT token
        $token = JWTAuth::refresh(JWTAuth::getToken());
        
        return $this->successResponse([
            'token' => $token,
        ]);
    }

    public function getRoute()
    {
        // Get assigned route
        $driver = auth()->user();
        
        if (!$driver->assigned_route_id) {
            return $this->errorResponse('No route assigned', null, 404);
        }

        $route = Route::with('stops')->findOrFail($driver->assigned_route_id);
        
        return $this->successResponse($route);
    }

    public function getRouteStops()
    {
        // Get route stops
        $driver = auth()->user();
        
        if (!$driver->assigned_route_id) {
            return $this->errorResponse('No route assigned', null, 404);
        }

        $stops = Route::findOrFail($driver->assigned_route_id)->stops;
        
        return $this->successResponse($stops);
    }

    public function markStopArrival($id)
    {
        // Mark stop as arrived
        // TODO: Implement stop arrival logic
    }

    public function getPassengers($tripId)
    {
        // Get trip passengers
        $trip = Trip::with('passengers.student')->findOrFail($tripId);
        
        return $this->successResponse($trip->passengers);
    }

    public function checkIn(Request $request)
    {
        // Check-in passenger
        // TODO: Implement passenger check-in logic
    }

    public function index(Request $request)
    {
        // List all drivers (admin only)
        // TODO: Implement with pagination, filters
    }

    public function store(Request $request)
    {
        // Create driver (admin only)
        // TODO: Implement driver creation
    }

    public function update(Request $request, $id)
    {
        // Update driver (admin only)
        // TODO: Implement driver update
    }

    public function destroy($id)
    {
        // Delete driver (admin only)
        // TODO: Implement soft delete
    }
}

