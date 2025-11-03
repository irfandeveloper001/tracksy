<?php

namespace App\Services\Trip;

use App\Models\TripStop;

class TripStopService
{
    public function markArrival($tripId, $stopId, $actualTime)
    {
        // Mark stop arrival and record timing
        // TODO: Implement stop arrival logic
    }

    public function checkInPassengers($tripId, $stopId)
    {
        // Auto check-in passengers at stop
        // TODO: Implement automatic passenger check-in
    }
}

