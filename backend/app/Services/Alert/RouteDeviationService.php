<?php

namespace App\Services\Alert;

use App\Models\Bus;
use App\Models\Route;
use App\Models\Location;
use App\Events\RouteDeviation;

class RouteDeviationService
{
    public function checkDeviation($busId, $currentLocation)
    {
        // Check if bus has deviated from route
        // Calculate distance from route
        // Return deviation data if significant
        // TODO: Implement route deviation detection algorithm
    }

    public function calculateDistanceFromRoute($location, $route)
    {
        // Calculate minimum distance from location to route polyline
        // TODO: Implement distance calculation using route stops
    }
}

