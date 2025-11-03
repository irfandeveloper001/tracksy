<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bus extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bus_number',
        'license_plate',
        'bus_type',
        'capacity',
        'current_route_id',
        'current_driver_id',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    // Relationships
    public function currentRoute()
    {
        return $this->belongsTo(Route::class, 'current_route_id');
    }

    public function currentDriver()
    {
        return $this->belongsTo(User::class, 'current_driver_id');
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function maintenance()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    public function getCurrentLocationAttribute()
    {
        return $this->locations()
            ->latest('recorded_at')
            ->first();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOnRoute($query)
    {
        return $query->whereNotNull('current_route_id');
    }
}

