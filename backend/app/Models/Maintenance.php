<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'type',
        'description',
        'scheduled_date',
        'completed_date',
        'cost',
        'technician',
        'status',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'date',
        'cost' => 'decimal:2',
    ];

    // Relationships
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }
}

