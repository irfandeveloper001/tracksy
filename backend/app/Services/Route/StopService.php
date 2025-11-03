<?php

namespace App\Services\Route;

use App\Models\Stop;

class StopService
{
    public function findNearbyStops($latitude, $longitude, $radius = 1000)
    {
        // Find nearby stops within radius (in meters)
        // TODO: Implement nearby stops calculation using Haversine formula
    }
}

