<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SeatAssignment;
use App\Notifications\BookingApproved;
use App\Notifications\BookingRejected;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Get all bookings with filters
     */
    public function index(Request $request)
    {
        $query = Booking::with(['student', 'bus', 'trip', 'adminApprovedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('trip_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('trip_date', '<=', $request->end_date);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by bus
        if ($request->has('bus_id')) {
            $query->where('bus_id', $request->bus_id);
        }

        // Search by booking reference
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhere('seat_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->limit ?? 20);

        return $this->successResponse($bookings);
    }

    /**
     * Get booking details
     */
    public function show($id)
    {
        $booking = Booking::with(['student', 'bus.currentRoute', 'trip', 'adminApprovedBy', 'seatAssignment'])
            ->findOrFail($id);

        // Check seat availability
        $seatAvailable = !SeatAssignment::where('bus_id', $booking->bus_id)
            ->where('seat_number', $booking->seat_number)
            ->where('trip_date', $booking->trip_date)
            ->where('status', '!=', 'available')
            ->where('booking_id', '!=', $booking->id)
            ->exists();

        $booking->seat_available = $seatAvailable;

        return $this->successResponse($booking);
    }

    /**
     * Approve booking
     */
    public function approve(Request $request, $id)
    {
        $booking = Booking::with(['student', 'bus'])->findOrFail($id);

        // Check if booking is already processed
        if ($booking->status !== 'pending') {
            return $this->errorResponse(
                'Booking is already ' . $booking->status . '. Cannot approve.',
                null,
                422
            );
        }

        // Check seat availability
        $seatOccupied = SeatAssignment::where('bus_id', $booking->bus_id)
            ->where('seat_number', $booking->seat_number)
            ->where('trip_date', $booking->trip_date)
            ->where('status', '!=', 'available')
            ->where('booking_id', '!=', $booking->id)
            ->exists();

        if ($seatOccupied) {
            return $this->errorResponse(
                'Seat ' . $booking->seat_number . ' is already reserved for this date.',
                null,
                422
            );
        }

        // Update booking status
        $booking->update([
            'status' => 'confirmed',
            'admin_approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => null,
            'rejected_at' => null,
        ]);

        // Create or update seat assignment
        SeatAssignment::updateOrCreate(
            [
                'bus_id' => $booking->bus_id,
                'seat_number' => $booking->seat_number,
                'trip_date' => $booking->trip_date,
            ],
            [
                'booking_id' => $booking->id,
                'status' => 'reserved',
            ]
        );

        // Send notification to student
        $booking->student->notify(new BookingApproved($booking));

        return $this->successResponse(
            $booking->fresh(['student', 'bus', 'adminApprovedBy']),
            'Booking approved successfully'
        );
    }

    /**
     * Reject booking
     */
    public function reject(Request $request, $id)
    {
        $this->validate($request, [
            'rejection_reason' => 'required|string|max:500',
        ]);

        $booking = Booking::with(['student', 'bus'])->findOrFail($id);

        // Check if booking is already processed
        if ($booking->status !== 'pending') {
            return $this->errorResponse(
                'Booking is already ' . $booking->status . '. Cannot reject.',
                null,
                422
            );
        }

        // Update booking status
        $booking->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'rejected_at' => now(),
            'admin_approved_by' => null,
            'approved_at' => null,
        ]);

        // Remove seat assignment if exists
        SeatAssignment::where('booking_id', $booking->id)->delete();

        // Send notification to student
        $booking->student->notify(new BookingRejected($booking, $request->rejection_reason));

        return $this->successResponse(
            $booking->fresh(['student', 'bus']),
            'Booking rejected successfully'
        );
    }

    /**
     * Get booking statistics
     */
    public function getStatistics()
    {
        $total = Booking::count();
        $pending = Booking::where('status', 'pending')->count();
        $confirmed = Booking::where('status', 'confirmed')->count();
        $rejected = Booking::where('status', 'rejected')->count();
        $cancelled = Booking::where('status', 'cancelled')->count();
        $completed = Booking::where('status', 'completed')->count();

        return $this->successResponse([
            'total' => $total,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'rejected' => $rejected,
            'cancelled' => $cancelled,
            'completed' => $completed,
        ]);
    }
}
