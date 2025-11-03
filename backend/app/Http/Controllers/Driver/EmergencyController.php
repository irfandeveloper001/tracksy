<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class EmergencyController extends Controller
{
    public function sendEmergency(Request $request)
    {
        // Send emergency alert
        $driver = auth()->user();
        
        $request->validate([
            'type' => 'required|in:accident,breakdown,medical,other',
            'description' => 'nullable|string',
            'location' => 'nullable|array',
        ]);

        $alert = Alert::create([
            'type' => 'emergency',
            'severity' => 'critical',
            'title' => 'Emergency Alert',
            'message' => $request->description ?? 'Emergency situation reported',
            'data' => [
                'emergency_type' => $request->type,
                'location' => $request->location,
            ],
            'driver_id' => $driver->id,
            'bus_id' => $driver->assigned_bus_id,
            'status' => 'new',
        ]);

        // TODO: Broadcast emergency alert
        // TODO: Send notifications to admin

        return $this->successResponse($alert, 'Emergency alert sent', 201);
    }

    public function reportIncident(Request $request)
    {
        // Report incident
        $driver = auth()->user();
        
        $request->validate([
            'type' => 'required|string',
            'description' => 'required|string',
            'location' => 'nullable|array',
            'photo_url' => 'nullable|url',
        ]);

        // TODO: Create incident report
        // TODO: Store incident data
        
        return $this->successResponse(null, 'Incident reported', 201);
    }
}

