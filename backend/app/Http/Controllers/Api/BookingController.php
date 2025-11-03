<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
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
            ->with(['bus', 'trip'])
            ->orderBy('trip_date', 'desc')
            ->paginate($request->limit ?? 10);
        
        return $this->successResponse($bookings);
    }

    public function store(Request $request)
    {
        // Create booking (for students)
        $student = auth()->user();
        
        $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'seat_number' => 'required|string',
            'trip_date' => 'required|date|after_or_equal:today',
        ]);

        // TODO: Check seat availability
        // TODO: Create booking
        // TODO: Assign seat
        // TODO: Generate booking reference
        // TODO: Send confirmation notification

        return $this->successResponse(null, 'Booking created', 201);
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

        // TODO: Cancel booking logic
        $booking->cancel(auth()->id());
        
        return $this->successResponse(null, 'Booking cancelled');
    }
}

