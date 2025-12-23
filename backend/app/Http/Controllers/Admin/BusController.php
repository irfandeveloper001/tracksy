<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Location;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        // Use database transaction to ensure atomicity
        DB::beginTransaction();
        
        try {
            // Validate route exists if provided
            if ($request->has('current_route_id') && $request->current_route_id) {
                $route = \App\Models\Route::find($request->current_route_id);
                if (!$route) {
                    DB::rollBack();
                    return $this->errorResponse('Selected route does not exist', null, 422);
                }
            }

            // Validate driver exists and is a driver if provided
            if ($request->has('current_driver_id') && $request->current_driver_id) {
                $driver = \App\Models\User::find($request->current_driver_id);
                if (!$driver) {
                    DB::rollBack();
                    return $this->errorResponse('Selected driver does not exist', null, 422);
                }
                
                // Ensure the user is actually a driver
                if ($driver->role !== 'driver') {
                    DB::rollBack();
                    return $this->errorResponse('Selected user is not a driver', null, 422);
                }

                // Check if driver is already assigned to another bus
                $existingBus = Bus::where('current_driver_id', $request->current_driver_id)
                    ->where('status', 'active')
                    ->first();
                
                if ($existingBus && $existingBus->id != ($request->bus_id ?? null)) {
                    DB::rollBack();
                    return $this->errorResponse('Driver is already assigned to another active bus', null, 422);
                }
            }

            // Create bus with all data
            $bus = Bus::create($request->only([
                'bus_number',
                'license_plate',
                'bus_type',
                'capacity',
                'current_route_id',
                'current_driver_id',
                'status',
            ]));

            // Update driver's assigned_bus_id if driver is assigned
            if ($request->current_driver_id) {
                $driver = \App\Models\User::find($request->current_driver_id);
                if ($driver) {
                    $driver->update(['assigned_bus_id' => $bus->id]);
                }
            }

            // Auto-assign students if route is assigned
            if ($request->current_route_id) {
                try {
                    $assignmentService = new \App\Services\Bus\StudentAssignmentService();
                    $assignmentResult = $assignmentService->assignStudentsToBus($bus->id, $request->current_route_id);
                    
                    if ($assignmentResult['assigned_count'] > 0) {
                        Log::info("Auto-assigned {$assignmentResult['assigned_count']} students to bus {$bus->id}");
                    }
                } catch (\Exception $e) {
                    // Log error but don't fail bus creation
                    Log::warning('Failed to auto-assign students to bus: ' . $e->getMessage());
                }
            }

            // Load relationships for response
            $bus->load(['currentRoute', 'currentDriver']);

            DB::commit();

            return $this->successResponse($bus, 'Bus created successfully with assigned route and driver', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bus creation failed: ' . $e->getMessage());
            return $this->errorResponse('Failed to create bus: ' . $e->getMessage(), null, 500);
        }
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

        // Check if route is being assigned or changed
        $oldRouteId = $bus->current_route_id;
        $newRouteId = $request->input('current_route_id');
        $routeChanged = $oldRouteId != $newRouteId && $newRouteId;

        $bus->update($request->only([
            'bus_number',
            'license_plate',
            'bus_type',
            'capacity',
            'current_route_id',
            'current_driver_id',
            'status',
        ]));

        // Auto-assign students if route is newly assigned or changed
        if ($routeChanged && $newRouteId) {
            try {
                $assignmentService = new \App\Services\Bus\StudentAssignmentService();
                $assignmentResult = $assignmentService->assignStudentsToBus($bus->id, $newRouteId);
                
                if ($assignmentResult['assigned_count'] > 0) {
                    Log::info("Auto-assigned {$assignmentResult['assigned_count']} students to bus {$bus->id} for route {$newRouteId}");
                }
            } catch (\Exception $e) {
                // Log error but don't fail bus update
                Log::warning('Failed to auto-assign students to bus: ' . $e->getMessage());
            }
        }

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

