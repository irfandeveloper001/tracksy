<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index()
    {
        // Get all routes (for students)
        $routes = Route::with('stops')->active()->get();
        
        return $this->successResponse($routes);
    }

    public function show($id)
    {
        // Get route details (for students)
        $route = Route::with(['stops', 'buses'])->findOrFail($id);
        
        return $this->successResponse($route);
    }

    public function getStops($id)
    {
        // Get route stops (for students)
        $route = Route::findOrFail($id);
        $stops = $route->stops;
        
        return $this->successResponse($stops);
    }
}

