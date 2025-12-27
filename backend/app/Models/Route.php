<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class Route extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'start_point',
        'end_point',
        'distance',
        'estimated_duration',
        'is_active',
        'status',
    ];

    protected $casts = [
        'distance' => 'decimal:2',
        'estimated_duration' => 'integer',
        'is_active' => 'boolean',
    ];

    // Override toArray to include compatibility fields
    public function toArray()
    {
        $array = parent::toArray();
        
        // Add origin and destination for frontend compatibility
        $array['origin'] = $this->start_point;
        $array['destination'] = $this->end_point;
        
        return $array;
    }

    // Relationships
    public function stops()
    {
        return $this->belongsToMany(Stop::class, 'route_stop')
            ->withPivot(['order', 'estimated_time'])
            ->orderBy('route_stop.order');
    }

    public function buses()
    {
        return $this->hasMany(Bus::class, 'current_route_id');
    }

    public function students()
    {
        return $this->hasMany(User::class, 'assigned_route_id')
            ->where('role', 'student');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
