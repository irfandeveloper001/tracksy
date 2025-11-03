<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relationships
    public function routes()
    {
        return $this->belongsToMany(Route::class, 'route_stop')
            ->withPivot(['order', 'estimated_time'])
            ->orderBy('route_stop.order');
    }

    public function tripStops()
    {
        return $this->hasMany(TripStop::class);
    }
}

