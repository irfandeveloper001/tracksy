<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\User;
use App\Models\Route;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Alert;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function generate(Request $request)
    {
        // Generate report
        $this->validate($request, [
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
        
        // Get trips data
        $trips = Trip::whereBetween('start_time', [$startDate, $endDate])->get();
        $completedTrips = $trips->where('status', 'completed');
        
        // Get bookings data
        $bookings = Booking::whereBetween('trip_date', [$startDate, $endDate])->get();
        
        // Get bus data
        $totalBuses = Bus::count();
        $activeBuses = Bus::where('status', 'active')->count();
        
        // Calculate bus utilization
        $totalBusCapacity = Bus::sum('capacity');
        $totalPassengers = $trips->sum('passenger_count');
        $averageUtilization = $totalBusCapacity > 0 ? round(($totalPassengers / ($totalBusCapacity * $trips->count())) * 100, 2) : 0;
        
        // Get student data
        $totalStudents = User::where('role', 'student')->count();
        $activeStudents = User::where('role', 'student')
            ->where(function ($query) {
                $query->where('status', 'active')
                    ->orWhereNull('status');
            })
            ->count();
        
        // Get route efficiency data
        $routeEfficiency = Route::get()->map(function ($route) use ($startDate, $endDate) {
            $routeTrips = Trip::where('route_id', $route->id)
                ->whereBetween('start_time', [$startDate, $endDate])
                ->get();
            
            if ($routeTrips->count() === 0) {
                return null;
            }
            
            $completedRouteTrips = $routeTrips->where('status', 'completed');
            $onTimePercentage = $routeTrips->count() > 0 
                ? round(($completedRouteTrips->count() / $routeTrips->count()) * 100, 2) 
                : 0;
            
            $averageDuration = $routeTrips->avg('duration') ?? 0;
            
            return [
                'route_name' => $route->name,
                'trips_count' => $routeTrips->count(),
                'average_duration' => round($averageDuration, 2),
                'on_time_percentage' => $onTimePercentage,
            ];
        })->filter(function ($route) {
            return $route !== null && $route['trips_count'] > 0;
        })->values();
        
        // Get incidents (alerts)
        $incidents = Alert::whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => (string)$alert->id,
                    'type' => $alert->type,
                    'description' => $alert->message ?? $alert->title,
                    'timestamp' => $alert->created_at->toISOString(),
                    'status' => $alert->status,
                ];
            });
        
        $report = [
            'total_trips' => $trips->count(),
            'student_usage' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_bookings' => $bookings->count(),
            ],
            'bus_performance' => [
                'total_buses' => $totalBuses,
                'active_buses' => $activeBuses,
                'average_utilization' => $averageUtilization,
            ],
            'route_efficiency' => $routeEfficiency->toArray(),
            'incidents' => $incidents->toArray(),
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'generated_at' => now()->toDateTimeString(),
        ];
        
        return $this->successResponse($report);
    }

    public function export(Request $request)
    {
        // Export report to PDF/Excel
        $this->validate($request, [
            'type' => 'required|in:daily,weekly,monthly,custom',
            'format' => 'required|in:pdf,excel',
            'start_date' => 'required_if:type,custom|date',
            'end_date' => 'required_if:type,custom|date',
        ]);

        // For now, return a simple response indicating export is not yet implemented
        // In production, you would use libraries like dompdf for PDF or PhpSpreadsheet for Excel
        return $this->errorResponse(
            'Export functionality is not yet implemented. Please use the generate endpoint to get report data.',
            null,
            501
        );
    }
}
