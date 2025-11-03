<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index()
    {
        // List all routes
        $routes = Route::with('stops')->active()->get();
        
        return $this->successResponse($routes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'start_point' => 'required|string',
            'end_point' => 'required|string',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.order' => 'required|integer|min:1',
            'stops.*.estimated_time' => 'nullable|integer|min:0',
        ]);

        $route = Route::create($request->only([
            'name',
            'start_point',
            'end_point',
            'distance',
            'estimated_duration',
        ]));

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
        $route = Route::with('stops')->findOrFail($id);
        
        return $this->successResponse($route);
    }

    public function update(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_point' => 'sometimes|string',
            'end_point' => 'sometimes|string',
            'distance' => 'nullable|numeric|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'stops' => 'nullable|array',
            'stops.*.stop_id' => 'required|exists:stops,id',
            'stops.*.order' => 'required|integer|min:1',
            'stops.*.estimated_time' => 'nullable|integer|min:0',
        ]);

        $route->update($request->only([
            'name',
            'start_point',
            'end_point',
            'distance',
            'estimated_duration',
            'is_active',
        ]));

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

