<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $request->only('email', 'password');
        
        // Try to find user by email or student_id or driver_id
        $user = User::where('email', $credentials['email'])
            ->orWhere('student_id', $credentials['email'])
            ->orWhere('driver_id', $credentials['email'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (!$token = JWTAuth::fromUser($user)) {
            return response()->json([
                'message' => 'Could not create token',
            ], 500);
        }

        return response()->json([
            'token' => $token,
            'refreshToken' => $token, // In production, use separate refresh token
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'student_id' => $user->student_id,
                'institution' => $user->institution,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|string|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'institution' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'student_id' => $request->student_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'institution' => $request->institution,
            'role' => 'student',
        ]);

        $user->assignRole('student');

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'refreshToken' => $token, // In production, use separate refresh token
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'student_id' => $user->student_id,
                'institution' => $user->institution,
            ],
        ], 201);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    public function me()
    {
        $user = Auth::user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'student_id' => $user->student_id,
            'driver_id' => $user->driver_id,
            'institution' => $user->institution,
        ]);
    }
}

