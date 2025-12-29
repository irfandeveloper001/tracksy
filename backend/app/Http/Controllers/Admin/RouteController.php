<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        // List all routes with filters and pagination
        $query = Route::with('stops')
            ->withCount([
                'stops',
                'buses as active_buses_count',
                'students as student_count',
            ]);
        
        // Apply status filter
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where(function($q) {
                    $q->where('status', 'active')->orWhere('is_active', true);
                });
            } elseif ($request->status === 'inactive') {
                $query->where(function($q) {
                    $q->where('status', 'inactive')->orWhere('is_active', false);
                });
            }
        }
        
        // Apply search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('start_point', 'like', "%{$search}%")
                  ->orWhere('end_point', 'like', "%{$search}%")
                  ->orWhere('origin', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%");
            });
        }
        
        // Paginate if limit is provided, otherwise return all
        if ($request->has('limit') || $request->has('page')) {
            $perPage = $request->limit ?? 20;
            $routes = $query->paginate($perPage);
        } else {
            $routes = $query->get();
        }
        
        return $this->successResponse($routes);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'start_point' => 'required|string',
            'end_point' => 'required|string',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'is_active' => 'nullable|boolean',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.order' => 'required|integer|min:1',
            'stops.*.estimated_time' => 'nullable|integer|min:0',
        ]);

        // Determine status
        $status = $request->input('status', $request->input('is_active', true) ? 'active' : 'inactive');
        $isActive = $request->has('is_active') ? $request->input('is_active') : ($status === 'active');

        $route = Route::create([
            'name' => $request->input('name'),
            'start_point' => $request->input('start_point'),
            'end_point' => $request->input('end_point'),
            'distance' => $request->input('distance'),
            'estimated_duration' => $request->input('estimated_duration'),
            'status' => $status,
            'is_active' => $isActive,
        ]);

        // Attach stops if provided
        if ($request->has('stops')) {
            foreach ($request->stops as $stopData) {
                $route->stops()->attach($stopData['stop_id'], [
                    'order' => $stopData['order'],
                    'estimated_time' => $stopData['estimated_time'] ?? null,
                ]);
            }
        }

        return $this->successResponse($route->load('stops'), 'Route created successfully', 201);
    }

    public function show($id)
    {
        // Get route details
        $route = Route::with('stops')
            ->withCount([
                'stops',
                'buses as active_buses_count',
                'students as student_count',
            ])
            ->findOrFail($id);
        
        return $this->successResponse($route);
    }

    public function update(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'start_point' => 'sometimes|string',
            'end_point' => 'sometimes|string',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive',
            'is_active' => 'sometimes|boolean',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.order' => 'required|integer|min:1',
            'stops.*.estimated_time' => 'nullable|integer|min:0',
        ]);

        // Determine status
        $updateData = [
            'name' => $request->has('name') ? $request->input('name') : $route->name,
            'start_point' => $request->has('start_point') ? $request->input('start_point') : $route->start_point,
            'end_point' => $request->has('end_point') ? $request->input('end_point') : $route->end_point,
            'distance' => $request->has('distance') ? $request->input('distance') : $route->distance,
            'estimated_duration' => $request->has('estimated_duration') ? $request->input('estimated_duration') : $route->estimated_duration,
        ];

        if ($request->has('status')) {
            $updateData['status'] = $request->input('status');
            $updateData['is_active'] = $request->input('status') === 'active';
        } elseif ($request->has('is_active')) {
            $updateData['is_active'] = $request->input('is_active');
            $updateData['status'] = $request->input('is_active') ? 'active' : 'inactive';
        }

        $route->update($updateData);

        // Update stops if provided
        if ($request->has('stops')) {
            $route->stops()->detach();
            foreach ($request->stops as $stopData) {
                $route->stops()->attach($stopData['stop_id'], [
                    'order' => $stopData['order'],
                    'estimated_time' => $stopData['estimated_time'] ?? null,
                ]);
            }
        }

        return $this->successResponse($route->load('stops'), 'Route updated successfully');
    }

    public function destroy($id)
    {
        $route = Route::findOrFail($id);
        $route->delete();

        return $this->successResponse(null, 'Route deleted successfully');
    }

    public function getStops($id)
    {
        // Get route stops
        $route = Route::findOrFail($id);
        $stops = $route->stops;
        
        return $this->successResponse($stops);
    }
}
