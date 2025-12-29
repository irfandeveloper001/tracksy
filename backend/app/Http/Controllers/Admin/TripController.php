<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $query = Trip::with(['route', 'bus', 'driver'])
            ->withCount('bookings');

        if ($request->has('status')) {
            $status = $request->status === 'scheduled' ? 'not_started' : $request->status;
            $query->where('status', $status);
        }

        if ($request->has('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        if ($request->has('bus_id')) {
            $query->where('bus_id', $request->bus_id);
        }

        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('start_time', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('start_time', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('route', function ($routeQuery) use ($search) {
                    $routeQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('bus', function ($busQuery) use ($search) {
                    $busQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('number', 'like', "%{$search}%");
                })
                ->orWhereHas('driver', function ($driverQuery) use ($search) {
                    $driverQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        $trips = $query->orderBy('start_time', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->successResponse($trips);
    }

    public function show($id)
    {
        $trip = Trip::with(['route', 'bus', 'driver'])
            ->withCount('bookings')
            ->findOrFail($id);

        return $this->successResponse($trip);
    }

    public function cancel(Request $request, $id)
    {
        $trip = Trip::findOrFail($id);

        if (in_array($trip->status, ['completed', 'cancelled'], true)) {
            return $this->errorResponse('Trip is already completed or cancelled', null, 422);
        }

        $trip->status = 'cancelled';
        $trip->end_time = now();
        if ($trip->start_time && !$trip->duration) {
            $trip->duration = $trip->start_time->diffInMinutes(now());
        }
        $trip->save();

        return $this->successResponse(
            $trip->fresh()->load(['route', 'bus', 'driver']),
            'Trip cancelled successfully'
        );
    }
}
