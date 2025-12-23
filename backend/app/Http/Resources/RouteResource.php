<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RouteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_point' => $this->start_point,
            'end_point' => $this->end_point,
            // Add compatibility fields for frontend
            'origin' => $this->start_point,
            'destination' => $this->end_point,
            'distance' => $this->distance,
            'estimated_duration' => $this->estimated_duration,
            'is_active' => $this->is_active,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            'stops' => $this->whenLoaded('stops'),
        ];
    }
}
