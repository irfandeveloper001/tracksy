<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        // List all students (admin only)
        // TODO: Implement with pagination, search, filters
        $students = User::students()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->institution, function ($query, $institution) {
                return $query->where('institution', $institution);
            })
            ->paginate($request->limit ?? 10);

        return $this->successResponse($students);
    }

    public function show($id)
    {
        // Get student details
        $student = User::students()->findOrFail($id);
        
        return $this->successResponse([
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'student_id' => $student->student_id,
            'institution' => $student->institution,
            'bookings' => $student->bookings,
            'status' => $student->status,
        ]);
    }

    public function store(Request $request)
    {
        // Create new student (admin only)
        // TODO: Implement validation
        // TODO: Implement creation logic
    }

    public function update(Request $request, $id)
    {
        // Update student (admin only)
        // TODO: Implement validation
        // TODO: Implement update logic
    }

    public function destroy($id)
    {
        // Delete student (admin only)
        // TODO: Implement soft delete
    }
}

