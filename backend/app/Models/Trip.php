<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'bus_id',
        'route_id',
        'start_time',
        'end_time',
        'start_location',
        'end_location',
        'status',
        'distance',
        'duration',
        'passenger_count',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'start_location' => 'array',
        'end_location' => 'array',
        'distance' => 'decimal:2',
        'duration' => 'integer',
        'passenger_count' => 'integer',
    ];

    // Relationships
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function stops()
    {
        return $this->hasMany(TripStop::class);
    }

    public function passengers()
    {
        return $this->hasMany(TripPassenger::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // Methods
    public function end($endLocation = null)
    {
        $this->update([
            'status' => 'completed',
            'end_time' => now(),
            'end_location' => $endLocation,
            'duration' => $this->start_time->diffInMinutes(now()),
        ]);
    }

    // Scopes
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}

