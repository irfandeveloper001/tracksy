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
        // Create new route
        // TODO: Implement validation
        // TODO: Implement route creation with stops
    }

    public function show($id)
    {
        // Get route details
        $route = Route::with('stops')->findOrFail($id);
        
        return $this->successResponse($route);
    }

    public function update(Request $request, $id)
    {
        // Update route
        // TODO: Implement validation
        // TODO: Implement route update
    }

    public function destroy($id)
    {
        // Delete route
        // TODO: Implement soft delete
    }

    public function getStops($id)
    {
        // Get route stops
        $route = Route::findOrFail($id);
        $stops = $route->stops;
        
        return $this->successResponse($stops);
    }
}

