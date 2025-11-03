<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Alert;

class EmergencyAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $alert;

    public function __construct(Alert $alert)
    {
        $this->alert = $alert;
    }

    public function broadcastOn()
    {
        $channels = [
            new Channel('admin.emergency'),
            new Channel('admin.alerts'),
        ];

        if ($this->alert->bus_id) {
            $channels[] = new Channel('bus.' . $this->alert->bus_id . '.emergency');
        }

        if ($this->alert->driver_id) {
            $channels[] = new Channel('driver.' . $this->alert->driver_id . '.emergency');
        }

        return $channels;
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->alert->id,
            'type' => 'emergency',
            'severity' => 'critical',
            'title' => $this->alert->title,
            'message' => $this->alert->message,
            'data' => $this->alert->data,
            'bus_id' => $this->alert->bus_id,
            'driver_id' => $this->alert->driver_id,
            'created_at' => $this->alert->created_at,
        ];
    }
}

