<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Trip;

class TripStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $trip;

    public function __construct(Trip $trip)
    {
        $this->trip = $trip;
    }

    public function broadcastOn()
    {
        return [
            new Channel('driver.' . $this->trip->driver_id . '.trips'),
            new Channel('admin.dashboard'),
        ];
    }

    public function broadcastWith()
    {
        return [
            'trip_id' => $this->trip->id,
            'driver_id' => $this->trip->driver_id,
            'bus_id' => $this->trip->bus_id,
            'route_id' => $this->trip->route_id,
            'start_time' => $this->trip->start_time,
        ];
    }
}

