<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class ApiAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Check if token is present in Authorization header
            $token = $request->bearerToken();
            
            if (!$token) {
                // Try to get token from Authorization header manually
                $authHeader = $request->header('Authorization');
                if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
                    $token = substr($authHeader, 7);
                }
            }
            
            if (!$token) {
                return response()->json([
                    'message' => 'Token not provided. Please log in again.',
                    'error' => 'missing_token',
                ], 401);
            }

            // Parse and authenticate token
            $user = JWTAuth::setToken($token)->authenticate();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not found or token invalid. Please log in again.',
                    'error' => 'user_not_found',
                ], 401);
            }

            // Set user on request so $request->user() works
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
            // Set the authenticated user for the 'api' guard so auth() helper works
            Auth::guard('api')->setUser($user);

        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'message' => 'Token has expired. Please log in again.',
                'error' => 'token_expired',
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json([
                'message' => 'Token is invalid. Please log in again.',
                'error' => 'token_invalid',
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json([
                'message' => 'Token error: ' . $e->getMessage() . '. Please log in again.',
                'error' => 'token_error',
            ], 401);
        } catch (\Exception $e) {
            \Log::error('ApiAuth middleware error: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'message' => 'Authentication failed. Please log in again.',
                'error' => 'auth_failed',
            ], 401);
        }

        return $next($request);
    }
}

