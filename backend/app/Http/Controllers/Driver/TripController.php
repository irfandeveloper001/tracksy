<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function start(Request $request)
    {
        // Start a new trip
        // TODO: Implement trip start logic
        // - Validate driver and bus
        // - Create trip record
        // - Initialize location tracking
        // - Broadcast trip started event
    }

    public function end($id, Request $request)
    {
        // End a trip
        $trip = Trip::findOrFail($id);
        
        // TODO: Implement trip end logic
        // - Calculate trip statistics
        // - Update trip status
        // - Store final location
        // - Broadcast trip ended event
    }

    public function getCurrent()
    {
        // Get current active trip
        $driver = auth()->user();
        
        $trip = Trip::where('driver_id', $driver->id)
            ->where('status', 'in_progress')
            ->with(['bus', 'route', 'stops'])
            ->first();
        
        if (!$trip) {
            return $this->errorResponse('No active trip', null, 404);
        }

        return $this->successResponse($trip);
    }

    public function index(Request $request)
    {
        // Get trip history
        $driver = auth()->user();
        
        $trips = Trip::where('driver_id', $driver->id)
            ->when($request->startDate, function ($query, $date) {
                return $query->whereDate('start_time', '>=', $date);
            })
            ->when($request->endDate, function ($query, $date) {
                return $query->whereDate('start_time', '<=', $date);
            })
            ->orderBy('start_time', 'desc')
            ->paginate($request->limit ?? 10);
        
        return $this->successResponse($trips);
    }

    public function show($id)
    {
        // Get trip details
        $trip = Trip::with(['bus', 'route', 'stops', 'passengers'])
            ->findOrFail($id);
        
        return $this->successResponse($trip);
    }
}

