<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\User;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function getOverview()
    {
        // Get dashboard overview metrics
        $today = now()->startOfDay();
        $todayTrips = Trip::whereDate('start_time', $today)->get();
        $onTimeTrips = $todayTrips->filter(function ($trip) {
            // Simple on-time calculation - can be enhanced with scheduled times
            return $trip->status === 'completed';
        })->count();
        
        $overview = [
            'total_buses' => Bus::count(),
            'active_buses' => Bus::active()->count(),
            'total_students' => User::students()->count(),
            'total_routes' => Route::active()->count(),
            'on_time_percentage' => $todayTrips->count() > 0 ? round(($onTimeTrips / $todayTrips->count()) * 100, 2) : 0,
            'current_alerts' => \App\Models\Alert::where('status', 'new')->count(),
        ];

        return $this->successResponse($overview);
    }

    public function getUsageStatistics(Request $request)
    {
        $startDate = $request->startDate ? \Carbon\Carbon::parse($request->startDate) : now()->subDays(30);
        $endDate = $request->endDate ? \Carbon\Carbon::parse($request->endDate) : now();
        
        // Daily trip counts
        $dailyTrips = Trip::whereBetween('start_time', [$startDate, $endDate])
            ->selectRaw('DATE(start_time) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => (int)$item->count,
                ];
            });
        
        // Peak hours analysis
        $peakHours = Trip::whereBetween('start_time', [$startDate, $endDate])
            ->selectRaw('HOUR(start_time) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => (int)$item->hour,
                    'count' => (int)$item->count,
                ];
            });
        
        // Route popularity
        $routePopularity = Route::withCount(['trips' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('start_time', [$startDate, $endDate]);
        }])
        ->orderBy('trips_count', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($route) {
            return [
                'route_id' => $route->id,
                'route_name' => $route->name,
                'trip_count' => $route->trips_count,
            ];
        });
        
        $statistics = [
            'date_range' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'daily_trips' => $dailyTrips,
            'peak_hours' => $peakHours,
            'route_popularity' => $routePopularity,
        ];
        
        return $this->successResponse($statistics);
    }

    public function getPerformanceMetrics(Request $request)
    {
        $startDate = $request->startDate ? \Carbon\Carbon::parse($request->startDate) : now()->subDays(30);
        $endDate = $request->endDate ? \Carbon\Carbon::parse($request->endDate) : now();
        
        $trips = Trip::whereBetween('start_time', [$startDate, $endDate])
            ->where('status', 'completed')
            ->get();
        
        // On-time percentage (simplified - can be enhanced with scheduled times)
        $totalTrips = $trips->count();
        $completedTrips = $trips->where('status', 'completed')->count();
        $onTimePercentage = $totalTrips > 0 ? round(($completedTrips / $totalTrips) * 100, 2) : 0;
        
        // Average duration
        $averageDuration = $trips->avg('duration') ?? 0;
        
        // Bus utilization rate
        $totalBusCapacity = Bus::sum('capacity');
        $totalPassengers = $trips->sum('passenger_count');
        $utilizationRate = $totalBusCapacity > 0 ? round(($totalPassengers / $totalBusCapacity) * 100, 2) : 0;
        
        $metrics = [
            'on_time_percentage' => $onTimePercentage,
            'average_duration' => round($averageDuration, 2),
            'bus_utilization_rate' => $utilizationRate,
            'total_trips' => $totalTrips,
            'completed_trips' => $completedTrips,
            'total_passengers' => $totalPassengers,
        ];
        
        return $this->successResponse($metrics);
    }
}

