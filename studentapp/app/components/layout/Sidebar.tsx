import { Link, useLocation } from "react-router";
import { 
  HomeIcon, 
  MapIcon, 
  BookmarkIcon, 
  TruckIcon,
  BanknotesIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  TruckIcon as TruckIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  BellIcon as BellIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from "@heroicons/react/24/solid";
import { useLanguage } from "../../lib/i18n/LanguageProvider";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  iconSolid: any;
  badge?: number;
}

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onLogout, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useLanguage();

  const navigation: NavItem[] = [
    { name: t('dashboard'), path: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: t('routes'), path: '/routes', icon: MapIcon, iconSolid: MapIconSolid },
    { name: t('myBookings'), path: '/bookings', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
    { name: t('feesPayments'), path: '/fees', icon: BanknotesIcon, iconSolid: BanknotesIconSolid },
    { name: t('trackBus'), path: '/tracking', icon: TruckIcon, iconSolid: TruckIconSolid },
    { name: t('notifications'), path: '/notifications', icon: BellIcon, iconSolid: BellIconSolid, badge: 3 },
    { name: t('profile'), path: '/profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
    { name: t('settings'), path: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl
          flex-shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-indigo-700/50 bg-gradient-to-r from-indigo-900 to-purple-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-indigo-100 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tracksy</h1>
                <p className="text-xs text-indigo-300 flex items-center">
                  <SparklesIcon className="w-3 h-3 mr-1" />
                  {t('studentPortal')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white text-indigo-900 shadow-xl shadow-indigo-900/20 transform scale-105'
                      : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-6 h-6 mr-3 ${isActive(item.path) ? 'text-indigo-600' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Settings & Logout */}
          <div className="px-3 py-4 border-t border-indigo-700/50 space-y-2 bg-gradient-to-b from-transparent to-purple-900/30">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-indigo-100 rounded-xl hover:bg-indigo-700/50 hover:text-white transition-all hover:translate-x-1"
            >
              <Cog6ToothIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">{t('settings')}</span>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 text-indigo-100 rounded-xl hover:bg-red-600 hover:text-white transition-all hover:translate-x-1"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-indigo-700/50 bg-indigo-900/50">
            <div className="text-xs text-indigo-300">
              <p className="font-medium">Tracksy © 2025</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
