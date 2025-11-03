<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Booking;
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
        
        // Get all bookings for this bus and date
        $bookings = Booking::where('bus_id', $bus->id)
            ->where('trip_date', $tripDate)
            ->where('status', '!=', 'cancelled')
            ->get();
        
        // Get seat assignments
        $seatAssignments = \App\Models\SeatAssignment::where('bus_id', $bus->id)
            ->where('trip_date', $tripDate)
            ->where('status', '!=', 'cancelled')
            ->get();
        
        // Calculate seat statuses
        $occupiedSeats = $bookings->where('status', 'confirmed')->pluck('seat_number')->toArray();
        $reservedSeats = $seatAssignments->where('status', 'reserved')->pluck('seat_number')->toArray();
        $allBookedSeats = array_unique(array_merge($occupiedSeats, $reservedSeats));
        
        $totalSeats = $bus->capacity;
        $occupiedCount = count($occupiedSeats);
        $reservedCount = count(array_diff($reservedSeats, $occupiedSeats));
        $availableCount = $totalSeats - count($allBookedSeats);
        
        // Generate seat map
        $seatMap = [];
        for ($i = 1; $i <= $totalSeats; $i++) {
            $seatNumber = (string)$i;
            if (in_array($seatNumber, $occupiedSeats)) {
                $seatMap[$seatNumber] = 'occupied';
            } elseif (in_array($seatNumber, $reservedSeats)) {
                $seatMap[$seatNumber] = 'reserved';
            } else {
                $seatMap[$seatNumber] = 'available';
            }
        }
        
        $availability = [
            'bus_id' => $bus->id,
            'trip_date' => $tripDate,
            'total_seats' => $totalSeats,
            'available_seats' => $availableCount,
            'occupied_seats' => $occupiedCount,
            'reserved_seats' => $reservedCount,
            'seat_map' => $seatMap,
        ];
        
        return $this->successResponse($availability);
    }
}

