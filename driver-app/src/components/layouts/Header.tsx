import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import { useWebLocationTracking } from '../../hooks/useWebLocationTracking';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notification);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const hasAssignedBus = Boolean(user?.assigned_bus?.id || user?.assigned_bus);
  const {
    isSupported,
    isEnabled,
    isTracking,
    lastUpdateTime,
    error: gpsError,
    toggleTracking,
  } = useWebLocationTracking();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to logout');
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

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/70 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">{t('appName')}</h1>
                <p className="text-xs text-gray-500 font-medium">{t('driverPortal')}</p>
              </div>
            </div>
          </div>

          {/* Right: Notifications & User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isTracking
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
                title={
                  gpsError ||
                  (!hasAssignedBus
                    ? 'Assign a bus to enable GPS tracking.'
                    : lastUpdateTime
                    ? `Last update: ${new Date(lastUpdateTime).toLocaleTimeString()}`
                    : 'Waiting for GPS updates.')
                }
              >
                <MapPinIcon className="h-4 w-4" />
                <span>{isTracking ? 'GPS On' : 'GPS Off'}</span>
              </div>
              <button
                type="button"
                onClick={toggleTracking}
                disabled={!isSupported || !hasAssignedBus}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEnabled ? 'Pause' : 'Enable'}
              </button>
            </div>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">{t('notifications')}</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      {t('noNotifications')}
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {t('viewAllNotifications')}
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
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Driver'}</p>
                  <p className="text-xs text-gray-500">Driver</p>
                </div>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Driver'}</p>
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
    </header>
  );
}
