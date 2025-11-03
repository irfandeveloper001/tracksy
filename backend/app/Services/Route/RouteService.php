<?php

namespace App\Services\Route;

use App\Models\Route;
use App\Models\Stop;

class RouteService
{
    public function calculateDistance($stops)
    {
        // Calculate total route distance using Haversine formula
        // TODO: Implement distance calculation
    }

    public function estimateDuration($distance, $stopsCount)
    {
        // Estimate route duration
        // TODO: Implement duration estimation
    }

    public function createRouteWithStops($routeData, $stops)
    {
        // Create route and attach stops with order
        // TODO: Implement route creation with stops
    }
}

