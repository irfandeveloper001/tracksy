import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../lib/store/authStore';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import notificationService from '../../lib/api/notificationService';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import settingsService from '../../lib/api/settingsService';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const [logoError, setLogoError] = useState(false);

  const { data: systemSettings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingsService.getSystemSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: notificationData, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications', user?.id],
    queryFn: () =>
      notificationService.getNotifications({
        user_id: user?.id,
        per_page: 6,
      }),
    enabled: Boolean(user?.id),
    refetchInterval: 30000,
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const appName = systemSettings?.app_name || t('appName');
  const appLogo = systemSettings?.app_logo;
  const showLogo = Boolean(appLogo) && !logoError;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/70 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl shadow-lg overflow-hidden flex items-center justify-center ring-1 ring-slate-200">
                {showLogo ? (
                  <div className="h-full w-full bg-white/90 flex items-center justify-center">
                    <img
                      src={appLogo}
                      alt={appName}
                      className="h-7 w-7 object-contain"
                      onError={() => setLogoError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(appName || 'T').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">{appName}</h1>
                <p className="text-xs text-gray-500 font-medium">{t('commandCenter')}</p>
              </div>
            </div>
          </div>

          {/* Right: Notifications & User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('live')}
            </div>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{t('notifications')}</h3>
                      <button
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                        onClick={async () => {
                          if (user?.id) {
                            await notificationService.markAllAsRead(user.id);
                            refetchNotifications();
                          }
                        }}
                      >
                        {t('markAllRead')}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {t('noNotifications')}
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={async () => {
                            if (!notification.read) {
                              await notificationService.markAsRead(notification.id);
                              refetchNotifications();
                            }
                            const actionUrl = notification.data?.action_url;
                            if (actionUrl) {
                              navigate(actionUrl);
                              setShowNotifications(false);
                            }
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 rounded-full bg-rose-500"></span>
                            )}
                          </div>
                          {notification.created_at && (
                            <p className="text-[11px] text-gray-400 mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                    >
                      {t('closeNotifications')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'viewer'}</p>
                </div>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('settings')}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('profile')}
                    </button>
                  </div>
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/40 to-transparent"></div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}
