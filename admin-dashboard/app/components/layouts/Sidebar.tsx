import { Link, useLocation } from 'react-router';
import {
  HomeIcon,
  TruckIcon,
  MapIcon,
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../lib/store/authStore';
import { hasPermission, PERMISSIONS } from '../../lib/utils/permissions';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      name: 'Buses',
      href: '/buses',
      icon: TruckIcon,
      permission: PERMISSIONS.BUSES_VIEW,
    },
    {
      name: 'Routes',
      href: '/routes',
      icon: MapIcon,
      permission: PERMISSIONS.ROUTES_VIEW,
    },
    {
      name: 'Students',
      href: '/students',
      icon: UserGroupIcon,
      permission: PERMISSIONS.USERS_VIEW,
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: UserIcon,
      permission: PERMISSIONS.USERS_VIEW,
    },
    {
      name: 'Admins',
      href: '/admins',
      icon: UserIcon,
      permission: PERMISSIONS.USERS_VIEW,
    },
    {
      name: 'Trips',
      href: '/trips',
      icon: MapPinIcon,
      permission: PERMISSIONS.BUSES_VIEW,
    },
    {
      name: 'Stops',
      href: '/stops',
      icon: MapPinIcon,
      permission: PERMISSIONS.ROUTES_VIEW,
    },
    {
      name: 'Live Map',
      href: '/live-map',
      icon: MapIcon,
      permission: PERMISSIONS.BUSES_VIEW,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: DocumentTextIcon,
      permission: PERMISSIONS.REPORTS_VIEW,
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: BellAlertIcon,
      permission: PERMISSIONS.ALERTS_VIEW,
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: WrenchScrewdriverIcon,
      permission: PERMISSIONS.BUSES_VIEW,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      permission: PERMISSIONS.SETTINGS_VIEW,
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(user, item.permission)
  );

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
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Tracksy Admin</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
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
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-200
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
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
              <p className="font-medium">Tracksy Admin</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
