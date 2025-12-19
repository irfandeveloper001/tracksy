<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $validated = $this->validate($request, [
            'email' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $credentials = $request->only('email', 'password');
        
        $user = User::where('email', $credentials['email'])
            ->orWhere('driver_id', $credentials['email'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials', null, 401);
        }

        // Check if user is admin or manager
        if (!in_array($user->role, ['admin', 'manager'])) {
            return $this->errorResponse('Access denied. Admin or manager role required.', null, 403);
        }

        if (!$token = JWTAuth::fromUser($user)) {
            return $this->errorResponse('Could not create token', null, 500);
        }

        return $this->successResponse([
            'token' => $token,
            'refreshToken' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'Login successful');
    }

    public function signup(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        // Ensure admin role exists, create it if it doesn't
        try {
            // Use 'api' guard as that's what the system uses
            $adminRole = Role::firstOrCreate(
                ['name' => 'admin', 'guard_name' => 'api'],
                ['name' => 'admin', 'guard_name' => 'api']
            );
            $user->assignRole($adminRole);
        } catch (\Exception $e) {
            // If role assignment fails, try alternative approaches
            try {
                // Try to find existing admin role with any guard
                $existingRole = Role::where('name', 'admin')->first();
                if ($existingRole) {
                    $user->assignRole($existingRole);
                } else {
                    // Last resort: create role with 'api' guard
                    $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'api']);
                    $user->assignRole($adminRole);
                }
            } catch (\Exception $e2) {
                // If all else fails, log but don't fail signup
                // The user still has role='admin' in the users table, which is what matters
                \Log::warning('Failed to assign admin role to user: ' . $e2->getMessage() . '. User created with role=admin in users table.');
            }
        }

        if (!$token = JWTAuth::fromUser($user)) {
            return $this->errorResponse('Could not create token', null, 500);
        }

        return $this->successResponse([
            'token' => $token,
            'refreshToken' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'Account created successfully', 201);
    }

    public function me(Request $request)
    {
        // Get admin profile - use request user from JWT middleware
        $admin = $request->user();
        
        if (!$admin) {
            return $this->errorResponse('User not authenticated', null, 401);
        }
        
        // Get permissions safely
        $permissions = [];
        if (method_exists($admin, 'getAllPermissions')) {
            try {
                $permissions = $admin->getAllPermissions();
            } catch (\Exception $e) {
                // If permissions fail, just use empty array
                $permissions = [];
            }
        }
        
        return $this->successResponse([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => $admin->role,
            'permissions' => $permissions,
        ]);
    }

    public function refreshToken()
    {
        // Refresh JWT token
        $token = JWTAuth::refresh(JWTAuth::getToken());
        
        return $this->successResponse([
            'token' => $token,
        ]);
    }

    public function index()
    {
        // List all admins
        $admins = User::admins()->get();
        
        return $this->successResponse($admins);
    }

    public function createUser(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,driver,admin',
            'student_id' => 'required_if:role,student|string|unique:users,student_id',
            'driver_id' => 'required_if:role,driver|string|unique:users,driver_id',
            'institution' => 'required_if:role,student|string',
            'license_number' => 'required_if:role,driver|string',
            'phone' => 'nullable|string',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ];

        if ($request->role === 'student') {
            $userData['student_id'] = $request->student_id;
            $userData['institution'] = $request->institution;
        } elseif ($request->role === 'driver') {
            $userData['driver_id'] = $request->driver_id;
            $userData['license_number'] = $request->license_number;
        }

        if ($request->has('phone')) {
            $userData['phone'] = $request->phone;
        }

        $user = User::create($userData);
        $user->assignRole($request->role);

        return $this->successResponse($user, 'User created successfully', 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $this->validate($request, [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'role' => 'sometimes|in:student,driver,admin',
            'student_id' => 'sometimes|string|unique:users,student_id,' . $id,
            'driver_id' => 'sometimes|string|unique:users,driver_id,' . $id,
            'institution' => 'sometimes|string',
            'license_number' => 'sometimes|string',
            'phone' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,on_leave',
            'assigned_bus_id' => 'nullable|exists:buses,id',
            'assigned_route_id' => 'nullable|exists:routes,id',
        ]);

        $updateData = $request->only(['name', 'email', 'institution', 'student_id', 'driver_id', 'license_number', 'phone', 'status', 'assigned_bus_id', 'assigned_route_id']);

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
            $updateData['role'] = $request->role;
        }

        $user->update($updateData);

        return $this->successResponse($user->fresh(), 'User updated successfully');
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return $this->successResponse(null, 'User deleted successfully');
    }
}

