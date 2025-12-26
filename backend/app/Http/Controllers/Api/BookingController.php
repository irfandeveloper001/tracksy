<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        // Get user bookings (for students)
        $student = auth()->user();
        
        $bookings = Booking::where('student_id', $student->id)
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->start_date, function ($query, $startDate) {
                return $query->whereDate('trip_date', '>=', $startDate);
            })
            ->when($request->end_date, function ($query, $endDate) {
                return $query->whereDate('trip_date', '<=', $endDate);
            })
            ->with(['bus.currentRoute', 'trip', 'student'])
            ->orderBy('trip_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->limit ?? 10);
        
        return $this->successResponse($bookings);
    }

    public function store(Request $request)
    {
        // Create booking (for students)
        $student = auth()->user();
        
        $this->validate($request, [
            'bus_id' => 'required|exists:buses,id',
            'seat_number' => 'required|string',
            'trip_date' => 'required|date|after_or_equal:today',
        ]);

        // Check seat availability (only check confirmed bookings, not pending)
        $existingBooking = Booking::where('bus_id', $request->bus_id)
            ->where('seat_number', $request->seat_number)
            ->where('trip_date', $request->trip_date)
            ->whereIn('status', ['confirmed', 'completed'])
            ->first();

        if ($existingBooking) {
            return $this->errorResponse('Seat already booked for this date', null, 422);
        }

        // Generate booking reference
        $bookingReference = 'BK-' . strtoupper(uniqid());

        // Create booking with pending status (requires admin approval)
        $booking = Booking::create([
            'student_id' => $student->id,
            'bus_id' => $request->bus_id,
            'seat_number' => $request->seat_number,
            'trip_date' => $request->trip_date,
            'booking_reference' => $bookingReference,
            'status' => 'pending', // Changed to pending - requires admin approval
        ]);

        // Don't create seat assignment yet - wait for admin approval
        // Seat assignment will be created when admin approves the booking
        $adminIds = User::whereIn('role', ['admin', 'manager', 'super_admin'])->pluck('id');
        if ($adminIds->isNotEmpty()) {
            $booking->load('bus');
            $tripDate = $booking->trip_date ? $booking->trip_date->format('M d, Y') : 'N/A';
            $busLabel = $booking->bus ? ($booking->bus->name . ' (' . $booking->bus->number . ')') : 'N/A';

            foreach ($adminIds as $adminId) {
                Notification::create([
                    'user_id' => $adminId,
                    'type' => 'general',
                    'notification_type' => 'info',
                    'title' => 'New Booking Request',
                    'message' => $student->name . ' requested seat ' . $booking->seat_number . ' on ' . $tripDate . ' (' . $busLabel . ').',
                    'data' => [
                        'booking_id' => $booking->id,
                        'booking_reference' => $booking->booking_reference,
                        'student_id' => $student->id,
                        'action_url' => '/bookings/' . $booking->id,
                    ],
                    'audience_type' => 'custom',
                    'audience_ids' => [$adminId],
                    'status' => 'sent',
                    'sent_at' => now(),
                    'read' => false,
                ]);
            }
        }

        return $this->successResponse($booking, 'Booking request submitted successfully. Waiting for admin approval.', 201);
    }

    public function show($id)
    {
        // Get booking details
        $booking = Booking::with(['bus', 'trip', 'student'])
            ->findOrFail($id);
        
        // Check if user owns this booking
        if ($booking->student_id !== auth()->id()) {
            return $this->errorResponse('Unauthorized', null, 403);
        }
        
        return $this->successResponse($booking);
    }

    public function destroy($id)
    {
        // Cancel booking
        $booking = Booking::findOrFail($id);
        
        // Check if user owns this booking
        if ($booking->student_id !== auth()->id()) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        // Cancel booking
        $booking->cancel(auth()->id());
        
        return $this->successResponse(null, 'Booking cancelled');
    }

    public function getStatistics(Request $request)
    {
        // Get trip statistics for authenticated student
        $student = auth()->user();
        
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : now()->subMonth();
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : now();
        
        $bookings = Booking::where('student_id', $student->id)
            ->whereBetween('trip_date', [$startDate, $endDate])
            ->with(['trip', 'bus.currentRoute'])
            ->get();
        
        $totalTrips = $bookings->count();
        $completedTrips = $bookings->where('status', 'completed')->count();
        $cancelledTrips = $bookings->where('status', 'cancelled')->count();
        
        // Calculate on-time percentage
        // This calculation uses trip start/end times as a proxy for arrival times
        // In a real system, you'd have estimated_arrival and actual_arrival fields
        $onTimeTrips = $bookings->filter(function ($booking) {
            if (!$booking->trip || !$booking->trip->start_time) {
                return false;
            }
            
            // If trip has end_time, compare with start_time + estimated duration
            if ($booking->trip->end_time && $booking->bus && $booking->bus->currentRoute) {
                $estimatedDuration = $booking->bus->currentRoute->estimated_duration ?? 60; // default 60 minutes
                $estimatedEndTime = \Carbon\Carbon::parse($booking->trip->start_time)->addMinutes($estimatedDuration);
                $actualEndTime = \Carbon\Carbon::parse($booking->trip->end_time);
                
                $diffMinutes = abs($actualEndTime->diffInMinutes($estimatedEndTime));
                return $diffMinutes <= 5; // 5 minutes tolerance
            }
            
            return false;
        })->count();
        
        $onTimePercentage = $totalTrips > 0 ? round(($onTimeTrips / $totalTrips) * 100) : 0;
        
        // Calculate total distance (sum of route distances)
        $totalDistance = $bookings->where('status', 'completed')->sum(function ($booking) {
            if ($booking->bus && $booking->bus->currentRoute) {
                return $booking->bus->currentRoute->distance ?? 15;
            }
            return 15; // Default 15km if no route data
        });
        
        // Calculate CO2 saved (approx 0.1 kg CO2 per km for bus vs car)
        $co2Saved = round($totalDistance * 0.1, 1);
        
        // Calculate average waiting time (placeholder - would need actual trip start/end data)
        $averageWaitingTime = 10; // Placeholder
        
        $statistics = [
            'totalTrips' => $totalTrips,
            'completedTrips' => $completedTrips,
            'cancelledTrips' => $cancelledTrips,
            'onTimePercentage' => $onTimePercentage,
            'averageWaitingTime' => $averageWaitingTime,
            'totalDistance' => round($totalDistance),
            'co2Saved' => $co2Saved,
            'dateRange' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
        ];
        
        return $this->successResponse($statistics);
    }

    public function getMonthlySummary(Request $request)
    {
        // Get monthly summary for authenticated student
        $student = auth()->user();
        
        $month = $request->month ?? now()->month;
        $year = $request->year ?? now()->year;
        
        $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();
        
        $bookings = Booking::where('student_id', $student->id)
            ->whereBetween('trip_date', [$startDate, $endDate])
            ->with(['trip', 'bus.currentRoute'])
            ->get();
        
        $summary = [
            'month' => $month,
            'year' => $year,
            'totalTrips' => $bookings->count(),
            'completedTrips' => $bookings->where('status', 'completed')->count(),
            'cancelledTrips' => $bookings->where('status', 'cancelled')->count(),
            'activeTrips' => $bookings->whereIn('status', ['confirmed', 'pending'])->count(),
            'totalDistance' => round($bookings->where('status', 'completed')->sum(function ($booking) {
                if ($booking->bus && $booking->bus->currentRoute) {
                    return $booking->bus->currentRoute->distance ?? 15;
                }
                return 15;
            })),
            'co2Saved' => round($bookings->where('status', 'completed')->sum(function ($booking) {
                $distance = 15;
                if ($booking->bus && $booking->bus->currentRoute) {
                    $distance = $booking->bus->currentRoute->distance ?? 15;
                }
                return $distance * 0.1;
            }), 1),
            'dailyBreakdown' => $bookings->groupBy(function ($booking) {
                return $booking->trip_date->format('Y-m-d');
            })->map(function ($dayBookings) {
                return [
                    'date' => $dayBookings->first()->trip_date->format('Y-m-d'),
                    'count' => $dayBookings->count(),
                    'completed' => $dayBookings->where('status', 'completed')->count(),
                ];
            })->values(),
        ];
        
        return $this->successResponse($summary);
    }

    public function getUsageStatistics(Request $request)
    {
        // Get usage statistics for authenticated student
        $student = auth()->user();
        
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : now()->subMonth();
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : now();
        
        $bookings = Booking::where('student_id', $student->id)
            ->whereBetween('trip_date', [$startDate, $endDate])
            ->with(['trip', 'bus.currentRoute'])
            ->get();
        
        // Peak hours analysis
        $peakHours = $bookings->filter(function ($booking) {
            return $booking->trip && $booking->trip->start_time;
        })->groupBy(function ($booking) {
            return \Carbon\Carbon::parse($booking->trip->start_time)->format('H');
        })->map(function ($hourBookings, $hour) {
            return [
                'hour' => (int)$hour,
                'count' => $hourBookings->count(),
            ];
        })->sortByDesc('count')->take(5)->values();
        
        // Favorite route
        $favoriteRoute = $bookings->groupBy(function ($booking) {
            return $booking->bus ? $booking->bus->current_route_id : null;
        })
            ->filter(function ($routeBookings, $routeId) {
                return $routeId !== null;
            })
            ->map(function ($routeBookings) {
                return $routeBookings->count();
            })
            ->sortDesc()
            ->keys()
            ->first();
        
        $favoriteRouteName = null;
        if ($favoriteRoute) {
            $route = \App\Models\Route::find($favoriteRoute);
            $favoriteRouteName = $route ? $route->name : null;
        }
        
        // Daily trip counts
        $dailyTrips = $bookings->groupBy(function ($booking) {
            return $booking->trip_date->format('Y-m-d');
        })->map(function ($dayBookings, $date) {
            return [
                'date' => $date,
                'count' => $dayBookings->count(),
            ];
        })->values();
        
        $statistics = [
            'dateRange' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'peakHours' => $peakHours,
            'favoriteRoute' => $favoriteRouteName,
            'dailyTrips' => $dailyTrips,
            'totalTrips' => $bookings->count(),
            'averageTripsPerDay' => $dailyTrips->count() > 0 
                ? round($bookings->count() / $dailyTrips->count(), 2) 
                : 0,
        ];
        
        return $this->successResponse($statistics);
    }
}
