<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $query = Notification::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('read')) {
            $query->where('read', filter_var($request->read, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('audience_type')) {
            $query->where('audience_type', $request->audience_type);
        }
        
        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);
        
        return $this->successResponse($notifications);
    }

    /**
     * Store a newly created notification.
     */
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'audience_type' => 'required|in:all,route,driver,student,custom',
        ];

        // Require audience_ids if audience_type is not 'all'
        if ($request->audience_type !== 'all') {
            $rules['audience_ids'] = 'required|array|min:1';
            $rules['audience_ids.*'] = 'required';
        } else {
            $rules['audience_ids'] = 'nullable|array';
        }

        $this->validate($request, $rules);

        // Determine user IDs based on audience type
        $userIds = $this->getUserIdsForAudience(
            $request->audience_type,
            $request->audience_ids ?? []
        );

        if (empty($userIds)) {
            return $this->errorResponse(
                'No users found for the selected audience. Please check your route, driver, or student selections.',
                null,
                422
            );
        }

        // Create notifications for each user
        $notifications = [];
        foreach ($userIds as $userId) {
            $notification = Notification::create([
                'user_id' => $userId,
                'type' => 'general', // Keep original type for compatibility
                'notification_type' => $request->type,
                'title' => $request->title,
                'message' => $request->message,
                'audience_type' => $request->audience_type,
                'audience_ids' => $request->audience_ids,
                'status' => 'sent',
                'sent_at' => now(),
                'data' => [
                    'notification_type' => $request->type,
                    'audience_type' => $request->audience_type,
                ],
            ]);
            $notifications[] = $notification;
        }

        return $this->successResponse([
            'notifications' => $notifications,
            'total_sent' => count($notifications),
        ], 'Notification sent successfully', 201);
    }

    /**
     * Get user IDs based on audience type and IDs.
     */
    private function getUserIdsForAudience(string $audienceType, array $audienceIds): array
    {
        if ($audienceType === 'all') {
            // Get all active users (students and drivers)
            return User::whereIn('role', ['student', 'driver'])
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
        }

        if ($audienceType === 'route') {
            // Get users assigned to specific routes
            $routeIds = array_map('intval', $audienceIds);
            
            // Get students assigned to routes
            $studentIds = User::where('role', 'student')
                ->whereIn('assigned_route_id', $routeIds)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            
            // Get drivers assigned to buses on these routes
            $driverIds = User::where('role', 'driver')
                ->whereHas('assignedBus', function ($q) use ($routeIds) {
                    $q->whereIn('current_route_id', $routeIds);
                })
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            
            // Also get drivers via Bus model where current_route_id matches
            $busDriverIds = \App\Models\Bus::whereIn('current_route_id', $routeIds)
                ->whereNotNull('current_driver_id')
                ->pluck('current_driver_id')
                ->toArray();
            
            $driverIds = array_unique(array_merge($driverIds, $busDriverIds));
            
            // Also get drivers directly assigned to routes
            $directDriverIds = User::where('role', 'driver')
                ->whereIn('assigned_route_id', $routeIds)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            
            return array_unique(array_merge($studentIds, $driverIds, $directDriverIds));
        }

        if ($audienceType === 'driver') {
            // Get specific drivers
            return User::where('role', 'driver')
                ->whereIn('id', $audienceIds)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
        }

        if ($audienceType === 'student') {
            // Get specific students
            return User::where('role', 'student')
                ->whereIn('id', $audienceIds)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
        }

        if ($audienceType === 'custom') {
            // Get specific user IDs
            return User::whereIn('id', $audienceIds)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
        }

        return [];
    }

    /**
     * Display the specified notification.
     */
    public function show(string $id)
    {
        $notification = Notification::findOrFail($id);
        return $this->successResponse($notification);
    }

    /**
     * Send a notification.
     */
    public function send(string $id)
    {
        $notification = Notification::findOrFail($id);
        
        if ($notification->status === 'sent') {
            return $this->errorResponse('Notification already sent', null, 400);
        }

        $notification->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return $this->successResponse($notification, 'Notification sent successfully');
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return $this->successResponse(null, 'Notification deleted successfully');
    }

    public function markAsRead(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return $this->successResponse($notification, 'Notification marked as read');
    }

    public function markAllAsRead(Request $request)
    {
        $query = Notification::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $updated = $query->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse(['updated_count' => $updated], 'All notifications marked as read');
    }
}
