<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        // List all alerts
        $alerts = Alert::with(['bus', 'route', 'driver'])
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->severity, function ($query, $severity) {
                return $query->where('severity', $severity);
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->limit ?? 20);
        
        return $this->successResponse($alerts);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'type' => 'required|in:route_deviation,delay,emergency,maintenance,system',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'severity' => 'nullable|in:low,medium,high,critical',
            'bus_id' => 'nullable|exists:buses,id',
            'route_id' => 'nullable|exists:routes,id',
        ]);

        $alert = Alert::create([
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'severity' => $request->severity ?? 'medium',
            'bus_id' => $request->bus_id,
            'route_id' => $request->route_id,
            'status' => 'new',
        ]);

        // Broadcast alert event
        event(new \App\Events\AlertCreated($alert));

        return $this->successResponse($alert, 'Alert created successfully', 201);
    }

    public function acknowledge(Request $request, $id)
    {
        // Acknowledge alert
        $alert = Alert::findOrFail($id);
        
        $alert->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'acknowledged_by' => $request->user()->id,
        ]);
        
        return $this->successResponse($alert, 'Alert acknowledged');
    }

    public function resolve(Request $request, $id)
    {
        // Resolve alert
        $alert = Alert::findOrFail($id);
        
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $request->user()->id,
        ]);
        
        return $this->successResponse($alert, 'Alert resolved');
    }
}

