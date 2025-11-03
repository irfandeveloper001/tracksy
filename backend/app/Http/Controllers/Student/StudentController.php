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
        $request->validate([
            'student_id' => 'required|string|unique:users,student_id',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6',
            'institution' => 'required|string',
        ]);

        $student = User::create([
            'student_id' => $request->student_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Hash::make($request->password),
            'institution' => $request->institution,
            'role' => 'student',
            'status' => 'active',
        ]);

        $student->assignRole('student');

        return $this->successResponse($student, 'Student created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $student = User::students()->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'institution' => 'sometimes|string',
            'student_id' => 'sometimes|string|unique:users,student_id,' . $id,
            'status' => 'sometimes|in:active,inactive',
        ]);

        $updateData = $request->only(['name', 'email', 'institution', 'student_id', 'status']);
        
        if ($request->has('password')) {
            $updateData['password'] = \Hash::make($request->password);
        }

        $student->update($updateData);

        return $this->successResponse($student->fresh(), 'Student updated successfully');
    }

    public function destroy($id)
    {
        $student = User::students()->findOrFail($id);
        $student->delete();

        return $this->successResponse(null, 'Student deleted successfully');
    }
}

