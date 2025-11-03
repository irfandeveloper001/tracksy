<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'stop_id',
        'scheduled_time',
        'actual_time',
        'passengers_boarding',
        'passengers_alighting',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'actual_time' => 'datetime',
        'passengers_boarding' => 'integer',
        'passengers_alighting' => 'integer',
    ];

    // Relationships
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function stop()
    {
        return $this->belongsTo(Stop::class);
    }
}

