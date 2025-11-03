<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'bus_id',
        'trip_id',
        'seat_number',
        'trip_date',
        'booking_reference',
        'status',
        'cancelled_at',
        'cancelled_by',
    ];

    protected $casts = [
        'trip_date' => 'date',
        'cancelled_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function seatAssignment()
    {
        return $this->hasOne(SeatAssignment::class);
    }

    // Methods
    public function cancel($userId = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $userId,
        ]);

        if ($this->seatAssignment) {
            $this->seatAssignment->update(['status' => 'available']);
        }
    }
}

