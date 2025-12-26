import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import authService from '../../lib/api/authService';
import toast from 'react-hot-toast';
import notificationService, { type StudentNotification } from '../../lib/api/notificationService';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
  user?: any;
}

export default function Header({ onMenuToggle, isSidebarOpen, user }: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
      navigate('/login');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowNotifications(false);
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, showNotifications]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (!showNotifications) return;

    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data.slice(0, 5));
        const count = data.filter((notification) => !notification.read).length;
        setUnreadCount(count);
      } catch (error) {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [showNotifications]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-2 hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tracksy Student
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Notifications & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative transition-all duration-200 hover:scale-110"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] bg-red-500 rounded-full flex items-center justify-center animate-pulse px-1">
                    <span className="text-xs text-white font-bold">{unreadCount}</span>
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <BellIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">ID: {user?.student_id || 'N/A'}</p>
                </div>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <UserCircleIcon className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
