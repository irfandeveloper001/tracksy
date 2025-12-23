import { Link, useLocation } from 'react-router';
import {
  HomeIcon,
  MapIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  BellAlertIcon,
  TruckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'My Trips',
      href: '/trips',
      icon: MapIcon,
    },
    {
      name: 'Trip History',
      href: '/trip/history',
      icon: ClockIcon,
    },
    {
      name: 'My Route',
      href: '/route',
      icon: MapPinIcon,
    },
    {
      name: 'My Bus',
      href: '/bus',
      icon: TruckIcon,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellAlertIcon,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-50 border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo (mobile) */}
          <div className="lg:hidden px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Tracksy Driver</h1>
            </div>
          </div>

          {/* User Info (Desktop) */}
          <div className="hidden lg:block px-4 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'D'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Driver'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  ID: {user?.driver_id || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-colors duration-200
                    ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium">Tracksy Driver</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


