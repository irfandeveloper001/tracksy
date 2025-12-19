<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Location;
use App\Models\Trip;
use Illuminate\Http\Request;

class BusController extends Controller
{
    public function index(Request $request)
    {
        // List all buses with filters
        $buses = Bus::with(['currentRoute', 'currentDriver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->route_id, function ($query, $routeId) {
                return $query->where('current_route_id', $routeId);
            })
            ->when($request->driver_id, function ($query, $driverId) {
                return $query->where('current_driver_id', $driverId);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('bus_number', 'like', "%{$search}%")
                    ->orWhere('license_plate', 'like', "%{$search}%");
            })
            ->paginate($request->limit ?? 20);
        
        return $this->successResponse($buses);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'bus_number' => 'required|string|unique:buses',
            'license_plate' => 'required|string|unique:buses',
            'bus_type' => 'required|in:standard,premium,luxury',
            'capacity' => 'required|integer|min:1|max:100',
            'current_route_id' => 'nullable|exists:routes,id',
            'current_driver_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:active,inactive,maintenance,emergency',
        ]);

        $bus = Bus::create($request->only([
            'bus_number',
            'license_plate',
            'bus_type',
            'capacity',
            'current_route_id',
            'current_driver_id',
            'status',
        ]));

        return $this->successResponse($bus, 'Bus created successfully', 201);
    }

    public function show($id)
    {
        // Get bus details
        $bus = Bus::with(['currentRoute', 'currentDriver', 'locations' => function ($query) {
            $query->latest('recorded_at')->limit(1);
        }])->findOrFail($id);
        
        return $this->successResponse($bus);
    }

    public function update(Request $request, $id)
    {
        $bus = Bus::findOrFail($id);

        $this->validate($request, [
            'bus_number' => 'sometimes|string|unique:buses,bus_number,' . $id,
            'license_plate' => 'sometimes|string|unique:buses,license_plate,' . $id,
            'bus_type' => 'sometimes|in:standard,premium,luxury',
            'capacity' => 'sometimes|integer|min:1|max:100',
            'current_route_id' => 'nullable|exists:routes,id',
            'current_driver_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:active,inactive,maintenance,emergency',
        ]);

        $bus->update($request->only([
            'bus_number',
            'license_plate',
            'bus_type',
            'capacity',
            'current_route_id',
            'current_driver_id',
            'status',
        ]));

        return $this->successResponse($bus, 'Bus updated successfully');
    }

    public function destroy($id)
    {
        $bus = Bus::findOrFail($id);
        $bus->delete();

        return $this->successResponse(null, 'Bus deleted successfully');
    }

    public function getLocation($id)
    {
        // Get bus current location
        $location = Location::where('bus_id', $id)
            ->latest('recorded_at')
            ->first();
        
        if (!$location) {
            return $this->errorResponse('Location not found', null, 404);
        }

        return $this->successResponse($location);
    }

    public function getHistory($id, Request $request)
    {
        // Get bus location history
        $locations = Location::where('bus_id', $id)
            ->when($request->startDate, function ($query, $date) {
                return $query->whereDate('recorded_at', '>=', $date);
            })
            ->when($request->endDate, function ($query, $date) {
                return $query->whereDate('recorded_at', '<=', $date);
            })
            ->orderBy('recorded_at', 'desc')
            ->paginate($request->limit ?? 50);
        
        return $this->successResponse($locations);
    }

    public function updateStatus(Request $request, $id)
    {
        $bus = Bus::findOrFail($id);

        $this->validate($request, [
            'status' => 'required|in:active,inactive,maintenance,emergency',
        ]);

        $bus->update(['status' => $request->status]);

        return $this->successResponse($bus, 'Bus status updated successfully');
    }

    public function getLocationHistory($id, Request $request)
    {
        // Get bus location history with date range
        $locations = Location::where('bus_id', $id)
            ->when($request->start_date, function ($query, $date) {
                return $query->whereDate('recorded_at', '>=', $date);
            })
            ->when($request->end_date, function ($query, $date) {
                return $query->whereDate('recorded_at', '<=', $date);
            })
            ->orderBy('recorded_at', 'desc')
            ->paginate($request->per_page ?? 50);
        
        return $this->successResponse($locations);
    }

    public function getTrips($id, Request $request)
    {
        // Get bus trip history
        $bus = Bus::findOrFail($id);
        
        $trips = \App\Models\Trip::where('bus_id', $id)
            ->with(['route', 'driver'])
            ->orderBy('start_time', 'desc')
            ->paginate($request->per_page ?? 20);
        
        return $this->successResponse($trips);
    }
}

