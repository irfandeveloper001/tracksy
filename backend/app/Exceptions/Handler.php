<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // Custom API error handling
        if ($request->expectsJson() || $request->is('api/*')) {
            // Handle validation errors
            if ($exception instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => 'Validation Error',
                    'errors' => $exception->errors(),
                ], 422);
            }

            // Handle authentication errors
            if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json([
                    'message' => 'Unauthorized - Please log in',
                ], 401);
            }

            // Handle not found errors
            if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                return response()->json([
                    'message' => 'Resource not found',
                ], 404);
            }

            // Handle callable errors (like auth() being called incorrectly)
            if (strpos($exception->getMessage(), 'is not callable') !== false) {
                \Log::error('Callable error: ' . $exception->getMessage(), [
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTraceAsString()
                ]);
                
                return response()->json([
                    'message' => 'Server configuration error. Please check server logs.',
                    'error' => 'Internal server error',
                ], 500);
            }

            // Handle all other errors for API
            if (config('app.debug')) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => $exception->getTraceAsString(),
                ], 500);
            } else {
                return response()->json([
                    'message' => 'Internal server error',
                ], 500);
            }
        }

        return parent::render($request, $exception);
    }
}

