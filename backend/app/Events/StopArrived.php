<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\TripStop;

class StopArrived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tripStop;

    public function __construct(TripStop $tripStop)
    {
        $this->tripStop = $tripStop;
    }

    public function broadcastOn()
    {
        $trip = $this->tripStop->trip;
        
        return [
            new Channel('route.' . $trip->route_id . '.stops'),
            new Channel('bus.' . $trip->bus_id . '.stops'),
            new Channel('driver.' . $trip->driver_id . '.stops'),
        ];
    }

    public function broadcastWith()
    {
        return [
            'trip_id' => $this->tripStop->trip_id,
            'stop_id' => $this->tripStop->stop_id,
            'arrived_at' => $this->tripStop->actual_time,
            'scheduled_time' => $this->tripStop->scheduled_time,
            'passengers_boarding' => $this->tripStop->passengers_boarding,
            'passengers_alighting' => $this->tripStop->passengers_alighting,
        ];
    }
}

