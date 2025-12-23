<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated driver
     */
    public function index(Request $request)
    {
        $driver = auth()->user();
        
        $query = Notification::where('user_id', $driver->id);
        
        // Filter by read status if provided
        if ($request->has('read')) {
            $query->where('read', filter_var($request->read, FILTER_VALIDATE_BOOLEAN));
        }
        
        // Get notifications ordered by most recent first
        $notifications = $query->orderBy('created_at', 'desc')
            ->get();
        
        return $this->successResponse($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount()
    {
        $driver = auth()->user();
        
        $count = Notification::where('user_id', $driver->id)
            ->where('read', false)
            ->count();
        
        return $this->successResponse(['count' => $count]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        $driver = auth()->user();
        
        $notification = Notification::where('user_id', $driver->id)
            ->findOrFail($id);
        
        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);
        
        return $this->successResponse($notification, 'Notification marked as read');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $driver = auth()->user();
        
        $updated = Notification::where('user_id', $driver->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
        
        return $this->successResponse(['updated_count' => $updated], 'All notifications marked as read');
    }

    /**
     * Get a single notification
     */
    public function show($id)
    {
        $driver = auth()->user();
        
        $notification = Notification::where('user_id', $driver->id)
            ->findOrFail($id);
        
        return $this->successResponse($notification);
    }
}





