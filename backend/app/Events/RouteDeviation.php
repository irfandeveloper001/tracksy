<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RouteDeviation implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $busId;
    public $deviationData;

    public function __construct($busId, $deviationData)
    {
        $this->busId = $busId;
        $this->deviationData = $deviationData;
    }

    public function broadcastOn()
    {
        return new Channel('bus.' . $this->busId . '.deviation');
    }

    public function broadcastWith()
    {
        return $this->deviationData;
    }
}

