<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function generate(Request $request)
    {
        // Generate report
        $request->validate([
            'type' => 'required|in:daily,weekly,monthly,custom',
            'startDate' => 'required_if:type,custom|date',
            'endDate' => 'required_if:type,custom|date',
        ]);

        $type = $request->type;
        $now = now();
        
        // Determine date range based on type
        switch ($type) {
            case 'daily':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'weekly':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;
            case 'monthly':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'custom':
                $startDate = \Carbon\Carbon::parse($request->startDate)->startOfDay();
                $endDate = \Carbon\Carbon::parse($request->endDate)->endOfDay();
                break;
        }
        
        // Get report data
        $trips = \App\Models\Trip::whereBetween('start_time', [$startDate, $endDate])->get();
        $bookings = \App\Models\Booking::whereBetween('trip_date', [$startDate, $endDate])->get();
        
        $report = [
            'type' => $type,
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'summary' => [
                'total_trips' => $trips->count(),
                'completed_trips' => $trips->where('status', 'completed')->count(),
                'total_bookings' => $bookings->count(),
                'confirmed_bookings' => $bookings->where('status', 'confirmed')->count(),
                'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
                'total_passengers' => $trips->sum('passenger_count'),
                'total_distance' => $trips->sum('distance'),
            ],
            'trips' => $trips->take(100)->values(), // Limit to 100 trips
            'generated_at' => now()->toDateTimeString(),
        ];
        
        return $this->successResponse($report);
    }
}

