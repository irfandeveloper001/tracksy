<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Location;
use Illuminate\Http\Request;

class BusController extends Controller
{
    public function index(Request $request)
    {
        // List all buses
        $buses = Bus::with(['currentRoute', 'currentDriver'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('bus_number', 'like', "%{$search}%")
                    ->orWhere('license_plate', 'like', "%{$search}%");
            })
            ->paginate($request->limit ?? 10);
        
        return $this->successResponse($buses);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bus_number' => 'required|string|unique:buses',
            'license_plate' => 'required|string|unique:buses',
            'bus_type' => 'required|in:standard,premium',
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

        $request->validate([
            'bus_number' => 'sometimes|string|unique:buses,bus_number,' . $id,
            'license_plate' => 'sometimes|string|unique:buses,license_plate,' . $id,
            'bus_type' => 'sometimes|in:standard,premium',
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
}

