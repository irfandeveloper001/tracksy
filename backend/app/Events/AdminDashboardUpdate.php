<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminDashboardUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $metrics;

    public function __construct($metrics)
    {
        $this->metrics = $metrics;
    }

    public function broadcastOn()
    {
        return new Channel('admin.dashboard');
    }

    public function broadcastWith()
    {
        return $this->metrics;
    }
}

