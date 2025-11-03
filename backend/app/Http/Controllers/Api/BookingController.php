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

        // Check seat availability
        $existingBooking = Booking::where('bus_id', $request->bus_id)
            ->where('seat_number', $request->seat_number)
            ->where('trip_date', $request->trip_date)
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($existingBooking) {
            return $this->errorResponse('Seat already booked for this date', null, 422);
        }

        // Generate booking reference
        $bookingReference = 'BK-' . strtoupper(uniqid());

        // Create booking
        $booking = Booking::create([
            'student_id' => $student->id,
            'bus_id' => $request->bus_id,
            'seat_number' => $request->seat_number,
            'trip_date' => $request->trip_date,
            'booking_reference' => $bookingReference,
            'status' => 'confirmed',
        ]);

        // Create seat assignment
        \App\Models\SeatAssignment::create([
            'booking_id' => $booking->id,
            'bus_id' => $request->bus_id,
            'seat_number' => $request->seat_number,
            'trip_date' => $request->trip_date,
            'status' => 'reserved',
        ]);

        return $this->successResponse($booking, 'Booking created successfully', 201);
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
}

