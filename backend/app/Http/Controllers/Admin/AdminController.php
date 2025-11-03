<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        // Admin login
        // TODO: Implement admin-specific login
        // Similar to AuthController but check for admin role
    }

    public function me()
    {
        // Get admin profile
        $admin = auth()->user();
        
        return $this->successResponse([
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => $admin->role,
            'permissions' => $admin->getAllPermissions(),
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
        // Create user (student, driver, or admin)
        // TODO: Implement user creation
    }

    public function updateUser(Request $request, $id)
    {
        // Update user
        // TODO: Implement user update
    }

    public function deleteUser($id)
    {
        // Delete user
        // TODO: Implement soft delete
    }
}

