<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        // List all students (admin only)
        $students = User::students()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->institution, function ($query, $institution) {
                return $query->where('institution', $institution);
            })
            ->paginate($request->per_page ?? $request->limit ?? 10);

        return $this->successResponse($students);
    }

    public function show($id)
    {
        // Get student details
        $student = User::students()
            ->with('assignedRoute')
            ->findOrFail($id);
        
        return $this->successResponse([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'student_id' => $student->student_id,
            'phone' => $student->phone,
            'institution' => $student->institution,
            'route_id' => $student->assigned_route_id,
            'route_name' => optional($student->assignedRoute)->name,
            'bookings' => $student->bookings,
            'status' => $student->status,
            'created_at' => $student->created_at,
            'updated_at' => $student->updated_at,
        ]);
    }

    public function bookings(Request $request, $id)
    {
        $student = User::students()->findOrFail($id);
        $perPage = $request->per_page ?? $request->limit ?? 10;

        $bookings = Booking::where('student_id', $student->id)
            ->with(['bus.currentRoute', 'trip'])
            ->orderBy('trip_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return $this->successResponse($bookings);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'student_id' => 'required|string|unique:users,student_id',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6',
            'institution' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $student = User::create([
            'student_id' => $request->student_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'institution' => $request->institution,
            'phone' => $request->phone ?? null,
            'role' => 'student',
            'status' => 'active',
        ]);

        $student->assignRole('student');

        return $this->successResponse($student, 'Student created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $student = User::students()->findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'institution' => 'sometimes|string',
            'student_id' => 'sometimes|string|unique:users,student_id,' . $id,
            'status' => 'sometimes|in:active,inactive,suspended',
            'phone' => 'nullable|string',
        ]);

        $updateData = $request->only(['name', 'email', 'institution', 'student_id', 'status', 'phone']);
        
        if ($request->has('password')) {
            $updateData['password'] = \Hash::make($request->password);
        }

        $student->update($updateData);

        return $this->successResponse($student->fresh(), 'Student updated successfully');
    }

    public function updateStatus(Request $request, $id)
    {
        $this->validate($request, [
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $student = User::students()->findOrFail($id);
        $student->update(['status' => $request->status]);

        return $this->successResponse($student->fresh(), 'Student status updated successfully');
    }

    public function destroy($id)
    {
        $student = User::students()->findOrFail($id);
        $student->delete();

        return $this->successResponse(null, 'Student deleted successfully');
    }
}
