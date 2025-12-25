import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import authService from "../lib/api/authService";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "fee_invoice",
      title: "New Fee Invoice",
      message: "Transportation fee for Spring 2025 - $500.00 due on Feb 1, 2025",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 2,
      type: "booking_confirmed",
      title: "Booking Confirmed",
      message: "Your bus booking for Route A has been confirmed",
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 3,
      type: "payment_success",
      title: "Payment Successful",
      message: "Your payment of $100.00 has been processed successfully",
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "fee_invoice":
      case "payment_due":
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
      case "payment_success":
      case "booking_confirmed":
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your latest activities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <CheckIcon className="w-5 h-5" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "unread"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No notifications</p>
              <p className="text-gray-500 text-sm mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
                  !notification.read ? "border-l-4 border-indigo-500" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {getTimeAgo(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

