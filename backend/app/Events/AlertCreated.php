<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Alert;

class AlertCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $alert;

    public function __construct(Alert $alert)
    {
        $this->alert = $alert;
    }

    public function broadcastOn()
    {
        $channels = [new Channel('admin.alerts')];

        if ($this->alert->bus_id) {
            $channels[] = new Channel('bus.' . $this->alert->bus_id . '.alerts');
        }

        if ($this->alert->route_id) {
            $channels[] = new Channel('route.' . $this->alert->route_id . '.alerts');
        }

        if ($this->alert->driver_id) {
            $channels[] = new Channel('driver.' . $this->alert->driver_id . '.alerts');
        }

        return $channels;
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->alert->id,
            'type' => $this->alert->type,
            'severity' => $this->alert->severity,
            'title' => $this->alert->title,
            'message' => $this->alert->message,
            'data' => $this->alert->data,
            'bus_id' => $this->alert->bus_id,
            'route_id' => $this->alert->route_id,
            'driver_id' => $this->alert->driver_id,
            'status' => $this->alert->status,
            'created_at' => $this->alert->created_at,
        ];
    }
}

