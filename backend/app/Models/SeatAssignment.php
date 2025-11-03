<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeatAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'bus_id',
        'seat_number',
        'trip_date',
        'status',
    ];

    protected $casts = [
        'trip_date' => 'date',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    // Scopes
    public function scopeForBusAndDate($query, $busId, $date)
    {
        return $query->where('bus_id', $busId)
            ->where('trip_date', $date);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeReserved($query)
    {
        return $query->where('status', 'reserved');
    }

    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }
}

