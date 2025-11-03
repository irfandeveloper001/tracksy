<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Alert;

class IncidentReported implements ShouldBroadcast
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
            new Channel('admin.incidents'),
            new Channel('admin.alerts'),
        ];

        if ($this->alert->bus_id) {
            $channels[] = new Channel('bus.' . $this->alert->bus_id . '.incidents');
        }

        return $channels;
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->alert->id,
            'type' => $this->alert->type,
            'title' => $this->alert->title,
            'message' => $this->alert->message,
            'data' => $this->alert->data,
            'bus_id' => $this->alert->bus_id,
            'driver_id' => $this->alert->driver_id,
            'created_at' => $this->alert->created_at,
        ];
    }
}

