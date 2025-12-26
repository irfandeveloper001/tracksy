<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function start(Request $request)
    {
        $driver = auth()->user();
        $bus = $driver->assignedBus;

        if (!$bus) {
            return $this->errorResponse('No bus assigned to driver', null, 400);
        }

        $this->validate($request, [
            'route_id' => 'required|exists:routes,id',
            'start_location' => 'nullable|array',
            'start_location.latitude' => 'required_with:start_location|numeric',
            'start_location.longitude' => 'required_with:start_location|numeric',
        ]);

        // Check if driver has active trip
        $activeTrip = Trip::where('driver_id', $driver->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeTrip) {
            return $this->errorResponse('Driver already has an active trip', null, 422);
        }

        $trip = Trip::create([
            'driver_id' => $driver->id,
            'bus_id' => $bus->id,
            'route_id' => $request->route_id,
            'start_time' => now(),
            'start_location' => $request->start_location ?? null,
            'status' => 'in_progress',
        ]);

        // Update bus status
        $bus->update([
            'status' => 'active',
            'current_route_id' => $request->route_id,
        ]);

        // Broadcast trip started event
        event(new \App\Events\TripStarted($trip));

        return $this->successResponse($trip->load(['bus', 'route', 'stops']), 'Trip started successfully', 201);
    }

    public function end($id, Request $request)
    {
        $trip = Trip::findOrFail($id);
        
        // Verify driver owns this trip
        if ($trip->driver_id !== auth()->id()) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        if ($trip->status !== 'in_progress') {
            return $this->errorResponse('Trip is not in progress', null, 422);
        }

        $this->validate($request, [
            'end_location' => 'nullable|array',
            'end_location.latitude' => 'required_with:end_location|numeric',
            'end_location.longitude' => 'required_with:end_location|numeric',
        ]);

        $trip->end($request->end_location ?? null);

        // Update bus status
        $trip->bus->update([
            'status' => 'inactive',
            'current_route_id' => null,
        ]);

        // Broadcast trip ended event
        event(new \App\Events\TripEnded($trip));

        return $this->successResponse($trip->fresh(['bus', 'route']), 'Trip ended successfully');
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

