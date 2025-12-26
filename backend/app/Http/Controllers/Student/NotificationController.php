<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $student = auth()->user();

        $query = Notification::where('user_id', $student->id);

        if ($request->has('read')) {
            $query->where('read', filter_var($request->read, FILTER_VALIDATE_BOOLEAN));
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();

        return $this->successResponse($notifications);
    }

    public function getUnreadCount()
    {
        $student = auth()->user();

        $count = Notification::where('user_id', $student->id)
            ->where('read', false)
            ->count();

        return $this->successResponse(['count' => $count]);
    }

    public function show($id)
    {
        $student = auth()->user();

        $notification = Notification::where('user_id', $student->id)->findOrFail($id);

        return $this->successResponse($notification);
    }

    public function markAsRead($id)
    {
        $student = auth()->user();

        $notification = Notification::where('user_id', $student->id)->findOrFail($id);
        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return $this->successResponse($notification, 'Notification marked as read');
    }

    public function markAllAsRead()
    {
        $student = auth()->user();

        $updated = Notification::where('user_id', $student->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return $this->successResponse(['updated_count' => $updated], 'All notifications marked as read');
    }

    public function destroy($id)
    {
        $student = auth()->user();

        $notification = Notification::where('user_id', $student->id)->findOrFail($id);
        $notification->delete();

        return $this->successResponse(null, 'Notification deleted successfully');
    }
}
