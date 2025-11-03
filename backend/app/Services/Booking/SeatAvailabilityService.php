<?php

namespace App\Services\Booking;

use App\Models\Bus;
use App\Models\SeatAssignment;
use App\Models\Booking;

class SeatAvailabilityService
{
    public function getSeatMap($busId, $tripDate)
    {
        // Generate seat map with availability status
        // TODO: Implement seat map generation
        // Return: {seat_number: 'available'|'occupied'|'reserved'}
    }

    public function getAvailabilityCount($busId, $tripDate)
    {
        // Get available, occupied, reserved seat counts
        // TODO: Implement availability count calculation
    }
}

