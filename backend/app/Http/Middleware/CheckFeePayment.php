<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Fee;

class CheckFeePayment
{
    /**
     * Handle an incoming request.
     *
     * Check if the authenticated student has any overdue fees.
     * If they do, restrict access to certain features (buses, routes, tracking).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only check for students
        if ($user && $user->role === 'student') {
            // Check if student has overdue fees
            $hasOverdueFees = Fee::where('user_id', $user->id)
                ->where('status', 'overdue')
                ->exists();

            if ($hasOverdueFees) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access restricted. You have overdue fees. Please pay your fees to access this feature.',
                    'error_code' => 'OVERDUE_FEES',
                    'redirect_to' => '/fees',
                ], 403);
            }
        }

        return $next($request);
    }
}
