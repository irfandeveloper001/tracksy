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
        // Create new bus
        // TODO: Implement validation
        // TODO: Implement bus creation
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
        // Update bus
        // TODO: Implement validation
        // TODO: Implement bus update
    }

    public function destroy($id)
    {
        // Delete bus
        // TODO: Implement soft delete
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

