<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Fee;
use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

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
            $enforceFeeClearance = true;

            if (
                Schema::hasTable('settings') &&
                Schema::hasColumn('settings', 'key') &&
                Schema::hasColumn('settings', 'category') &&
                Schema::hasColumn('settings', 'value')
            ) {
                $settingValue = Setting::where('category', 'system')
                    ->where('key', 'require_fee_clearance')
                    ->value('value');

                if ($settingValue !== null) {
                    $enforceFeeClearance = $settingValue === '1' || $settingValue === 'true' || $settingValue === true;
                }
            }

            if (!$enforceFeeClearance) {
                return $next($request);
            }

            // Check if student has any unpaid fees
            $hasOutstandingFees = Fee::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'overdue'])
                ->exists();

            if ($hasOutstandingFees) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access restricted. You have unpaid fees. Please pay your fees to access this feature.',
                    'error_code' => 'UNPAID_FEES',
                    'redirect_to' => '/fees',
                ], 403);
            }
        }

        return $next($request);
    }
}
