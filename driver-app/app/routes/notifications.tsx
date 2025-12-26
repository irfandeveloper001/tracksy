import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from "../../src/store/slices/notificationSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  BellIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notification
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const loadNotifications = async () => {
    try {
      await dispatch(getNotifications());
    } catch (error) {
      console.warn('⚠️ Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error(error || 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    const normalizedType = type?.toLowerCase() || '';
    switch (normalizedType) {
      case 'emergency':
      case 'safety':
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      case 'route_deviation':
      case 'delay':
        return <InformationCircleIcon className="h-6 w-6" />;
      case 'stop_arrival':
        return <BellIcon className="h-6 w-6" />;
      case 'seat_available':
      case 'general':
        return <BellIcon className="h-6 w-6" />;
      default:
        return <BellIcon className="h-6 w-6" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const normalizedType = type?.toLowerCase() || '';
    switch (normalizedType) {
      case 'emergency':
      case 'safety':
        return 'bg-red-100 text-red-600';
      case 'route_deviation':
      case 'delay':
        return 'bg-yellow-100 text-yellow-600';
      case 'stop_arrival':
      case 'seat_available':
        return 'bg-blue-100 text-blue-600';
      case 'general':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-500">
                    You'll receive notifications here from admin and system updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
                        !notification.read
                          ? 'border-l-4 border-l-indigo-600 bg-indigo-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 p-3 rounded-lg ${getNotificationColor(notification.type || notification.notification_type || 'general')}`}>
                            {getNotificationIcon(notification.type || notification.notification_type || 'general')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
                                  )}
                                </div>
                                <p className={`text-base mb-3 ${!notification.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{formatDate(notification.created_at)}</span>
                                  {notification.type && (
                                    <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
                                      {notification.type.replace(/_/g, ' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {notification.read && (
                                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}












