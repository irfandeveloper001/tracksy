<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function update(Request $request)
    {
        // Update bus location
        $driver = auth()->user();
        $bus = $driver->assignedBus ?: Bus::where('current_driver_id', $driver->id)->first();

        if (!$bus) {
            return $this->errorResponse('No bus assigned', null, 400);
        }

        $this->validate($request, [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric|min:0',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|between:0,360',
        ]);

        $location = Location::create([
            'bus_id' => $bus->id,
            'driver_id' => $driver->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'accuracy' => $request->accuracy,
            'speed' => $request->speed,
            'heading' => $request->heading,
            'recorded_at' => now(),
        ]);

        // Broadcast location update event
        event(new \App\Events\BusLocationUpdated($location));

        return $this->successResponse($location);
    }

    public function batchUpdate(Request $request)
    {
        // Batch location updates
        $driver = auth()->user();
        $bus = $driver->assignedBus ?: Bus::where('current_driver_id', $driver->id)->first();

        if (!$bus) {
            return $this->errorResponse('No bus assigned', null, 400);
        }

        $this->validate($request, [
            'locations' => 'required|array|min:1',
            'locations.*.latitude' => 'required|numeric|between:-90,90',
            'locations.*.longitude' => 'required|numeric|between:-180,180',
            'locations.*.accuracy' => 'nullable|numeric|min:0',
            'locations.*.speed' => 'nullable|numeric|min:0',
            'locations.*.heading' => 'nullable|numeric|between:0,360',
            'locations.*.timestamp' => 'nullable|date',
        ]);

        $locations = [];
        foreach ($request->locations as $loc) {
            $locations[] = Location::create([
                'bus_id' => $bus->id,
                'driver_id' => $driver->id,
                'latitude' => $loc['latitude'],
                'longitude' => $loc['longitude'],
                'accuracy' => $loc['accuracy'] ?? null,
                'speed' => $loc['speed'] ?? null,
                'heading' => $loc['heading'] ?? null,
                'recorded_at' => $loc['timestamp'] ?? now(),
            ]);
        }

        return $this->successResponse($locations);
    }
}
