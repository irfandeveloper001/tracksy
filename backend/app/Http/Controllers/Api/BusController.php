<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Location;
use Illuminate\Http\Request;

class BusController extends Controller
{
    public function index(Request $request)
    {
        // Get all buses (for students)
        $buses = Bus::with(['currentRoute', 'currentDriver'])
            ->when($request->routeId, function ($query, $routeId) {
                return $query->where('current_route_id', $routeId);
            })
            ->active()
            ->get();
        
        return $this->successResponse($buses);
    }

    public function show($id)
    {
        // Get bus details (for students)
        $bus = Bus::with(['currentRoute', 'currentDriver'])->findOrFail($id);
        
        return $this->successResponse($bus);
    }

    public function getLocation($id)
    {
        // Get bus current location (for students)
        $location = Location::where('bus_id', $id)
            ->latest('recorded_at')
            ->first();
        
        if (!$location) {
            return $this->errorResponse('Location not found', null, 404);
        }

        return $this->successResponse($location);
    }

    public function getSeatAvailability($id, Request $request)
    {
        // Get seat availability (for students)
        $bus = Bus::findOrFail($id);
        
        $tripDate = $request->tripDate ?? now()->toDateString();
        
        // TODO: Implement seat availability calculation
        // - Get all bookings for this bus and date
        // - Calculate available, occupied, reserved seats
        // - Return seat map
        
        $availability = [
            'bus_id' => $bus->id,
            'total_seats' => $bus->capacity,
            'available_seats' => 0, // TODO: Calculate
            'occupied_seats' => 0,  // TODO: Calculate
            'reserved_seats' => 0,  // TODO: Calculate
            'seat_map' => [],       // TODO: Generate seat map
        ];
        
        return $this->successResponse($availability);
    }
}

