<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Route;
use App\Models\Trip;
use App\Models\Booking;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class DriverController extends Controller
{
    public function login(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');
        
        $user = User::where('email', $credentials['email'])
            ->orWhere('driver_id', $credentials['email'])
            ->first();

        if (!$user || !\Hash::check($credentials['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials', null, 401);
        }

        // Check if user is driver
        if ($user->role !== 'driver') {
            return $this->errorResponse('Access denied. Driver role required.', null, 403);
        }

        if (!$token = JWTAuth::fromUser($user)) {
            return $this->errorResponse('Could not create token', null, 500);
        }

        return $this->successResponse([
            'token' => $token,
            'refreshToken' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'driver_id' => $user->driver_id,
                'assigned_bus' => $user->assignedBus,
                'assigned_route' => $user->assignedRoute,
            ],
        ], 'Login successful');
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

    public function updateProfile(Request $request)
    {
        $driver = auth()->user();
        
        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $driver->id,
            'phone' => 'nullable|string',
            'license_number' => 'sometimes|string',
        ]);

        $updateData = $request->only(['name', 'email', 'phone', 'license_number']);
        $driver->update($updateData);

        return $this->successResponse($driver->fresh()->load(['assignedBus', 'assignedRoute']), 'Profile updated successfully');
    }

    public function changePassword(Request $request)
    {
        $this->validate($request, [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        $driver = auth()->user();

        if (!\Hash::check($request->current_password, $driver->password)) {
            return $this->errorResponse('Current password is incorrect', null, 400);
        }

        $driver->update([
            'password' => \Hash::make($request->new_password),
        ]);

        return $this->successResponse(null, 'Password changed successfully');
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
        $driver = auth()->user();
        $trip = Trip::where('driver_id', $driver->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$trip) {
            return $this->errorResponse('No active trip found', null, 404);
        }

        // Create or update trip stop record
        $tripStop = \App\Models\TripStop::updateOrCreate(
            [
                'trip_id' => $trip->id,
                'stop_id' => $id,
            ],
            [
                'actual_time' => now(),
            ]
        );

        // Broadcast stop arrival event
        event(new \App\Events\StopArrived($tripStop));

        return $this->successResponse($tripStop, 'Stop arrival marked successfully');
    }

    public function getPassengers($tripId)
    {
        $trip = Trip::with(['bookings.student', 'bookings.bus'])->findOrFail($tripId);
        
        $passengers = $trip->bookings->map(function ($booking) {
            return [
                'id' => $booking->student->id,
                'name' => $booking->student->name,
                'student_id' => $booking->student->student_id,
                'seat_number' => $booking->seat_number,
                'booking_id' => $booking->id,
                'status' => $booking->status,
            ];
        });
        
        return $this->successResponse($passengers);
    }

    public function checkIn(Request $request)
    {
        $this->validate($request, [
            'student_id' => 'required|exists:users,id',
            'trip_id' => 'required|exists:trips,id',
            'seat_number' => 'nullable|string',
        ]);

        $driver = auth()->user();
        $trip = Trip::where('id', $request->trip_id)
            ->where('driver_id', $driver->id)
            ->firstOrFail();

        $booking = Booking::where('trip_id', $request->trip_id)
            ->where('student_id', $request->student_id)
            ->first();

        if (!$booking) {
            return $this->errorResponse('Booking not found for this trip', null, 404);
        }

        // Update booking status to confirmed if pending
        if ($booking->status === 'pending') {
            $booking->update(['status' => 'confirmed']);
        }

        // Create trip passenger record
        \App\Models\TripPassenger::updateOrCreate(
            [
                'trip_id' => $trip->id,
                'student_id' => $request->student_id,
            ],
            [
                'checked_in' => true,
                'checked_in_at' => now(),
                'seat_number' => $request->seat_number ?? $booking->seat_number,
            ]
        );

        $trip->increment('passenger_count');

        return $this->successResponse(['checked_in' => true], 'Passenger checked in successfully');
    }

    public function index(Request $request)
    {
        $drivers = User::drivers()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('driver_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->with(['assignedBus', 'assignedRoute'])
            ->paginate($request->limit ?? 10);

        return $this->successResponse($drivers);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'driver_id' => 'required|string|unique:users,driver_id',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6',
            'license_number' => 'required|string',
            'phone' => 'nullable|string',
        ]);

        $driver = User::create([
            'driver_id' => $request->driver_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'license_number' => $request->license_number,
            'phone' => $request->phone ?? null,
            'role' => 'driver',
            'status' => 'active',
        ]);

        $driver->assignRole('driver');

        return $this->successResponse($driver, 'Driver created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $driver = User::drivers()->findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'license_number' => 'sometimes|string',
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,on_leave,inactive',
            'assigned_bus_id' => 'nullable|exists:buses,id',
            'assigned_route_id' => 'nullable|exists:routes,id',
            'driver_id' => 'sometimes|string|unique:users,driver_id,' . $id,
        ]);

        $updateData = $request->only(['name', 'email', 'license_number', 'phone', 'status', 'assigned_bus_id', 'assigned_route_id', 'driver_id']);
        
        if ($request->has('password')) {
            $updateData['password'] = \Hash::make($request->password);
        }

        $driver->update($updateData);

        return $this->successResponse($driver->fresh()->load(['assignedBus', 'assignedRoute']), 'Driver updated successfully');
    }

    public function destroy($id)
    {
        $driver = User::drivers()->findOrFail($id);
        $driver->delete();

        return $this->successResponse(null, 'Driver deleted successfully');
    }
}

