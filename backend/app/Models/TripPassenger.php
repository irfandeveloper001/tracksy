<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripPassenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'student_id',
        'booking_id',
        'boarding_stop_id',
        'alighting_stop_id',
        'seat_number',
        'checked_in',
        'checked_in_at',
        'boarded',
        'boarded_at',
        'alighted',
        'alighted_at',
    ];

    protected $casts = [
        'checked_in' => 'boolean',
        'checked_in_at' => 'datetime',
        'boarded' => 'boolean',
        'boarded_at' => 'datetime',
        'alighted' => 'boolean',
        'alighted_at' => 'datetime',
    ];

    // Relationships
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function boardingStop()
    {
        return $this->belongsTo(Stop::class, 'boarding_stop_id');
    }

    public function alightingStop()
    {
        return $this->belongsTo(Stop::class, 'alighting_stop_id');
    }
}

