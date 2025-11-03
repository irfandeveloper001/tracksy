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
        // Create alert
        // TODO: Implement alert creation
    }

    public function acknowledge($id)
    {
        // Acknowledge alert
        $alert = Alert::findOrFail($id);
        
        $alert->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'acknowledged_by' => auth()->id(),
        ]);
        
        return $this->successResponse($alert, 'Alert acknowledged');
    }

    public function resolve($id)
    {
        // Resolve alert
        $alert = Alert::findOrFail($id);
        
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => auth()->id(),
        ]);
        
        return $this->successResponse($alert, 'Alert resolved');
    }
}

