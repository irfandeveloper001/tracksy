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
        
        $this->validate($request, [
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

        // Broadcast emergency alert
        event(new \App\Events\EmergencyAlert($alert));

        return $this->successResponse($alert, 'Emergency alert sent', 201);
    }

    public function reportIncident(Request $request)
    {
        // Report incident
        $driver = auth()->user();
        
        $this->validate($request, [
            'type' => 'required|string',
            'description' => 'required|string',
            'location' => 'nullable|array',
            'photo_url' => 'nullable|url',
        ]);

        // Create incident alert
        $alert = Alert::create([
            'type' => 'maintenance',
            'severity' => 'medium',
            'title' => 'Incident Report',
            'message' => $request->description,
            'data' => [
                'incident_type' => $request->type,
                'location' => $request->location,
                'photo_url' => $request->photo_url,
            ],
            'driver_id' => $driver->id,
            'bus_id' => $driver->assigned_bus_id,
            'status' => 'new',
        ]);

        // Broadcast incident event
        event(new \App\Events\IncidentReported($alert));
        
        return $this->successResponse($alert, 'Incident reported', 201);
    }
}

