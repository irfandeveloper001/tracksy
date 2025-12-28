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
import { useLanguage } from '../../lib/i18n/LanguageProvider';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: HomeIcon,
      section: 'main',
    },
    {
      name: t('myTrips'),
      href: '/trips',
      icon: MapIcon,
      section: 'operations',
    },
    {
      name: t('tripHistory'),
      href: '/trip/history',
      icon: ClockIcon,
      section: 'operations',
    },
    {
      name: t('myRoute'),
      href: '/route',
      icon: MapPinIcon,
      section: 'operations',
    },
    {
      name: t('myBus'),
      href: '/bus',
      icon: TruckIcon,
      section: 'operations',
    },
    {
      name: t('notifications'),
      href: '/notifications',
      icon: BellAlertIcon,
      section: 'account',
    },
    {
      name: t('profile'),
      href: '/profile',
      icon: UserIcon,
      section: 'account',
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: Cog6ToothIcon,
      section: 'account',
    },
  ];

  const sections = [
    { id: 'main', title: 'Main' },
    { id: 'operations', title: 'Operations' },
    { id: 'account', title: 'Account' },
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
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden backdrop-blur-md"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          shadow-2xl border-r border-white/10 ring-1 ring-white/10
        `}
      >
        <div className="flex flex-col h-full">
          {/* Profile & Brand */}
          <div className="relative border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-1 ring-white/20">
                  {(user?.name || 'D').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || 'Driver'}
                  </p>
                  <p className="text-xs text-indigo-200 truncate">
                    ID: {user?.driver_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
                {t('driverPortal')}
              </p>
              <p className="text-xs text-indigo-100">
                Manage trips, routes, and updates
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
                  {section.title}
                </p>
                {navigation
                  .filter((item) => item.section === section.id)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => {
                          if (onClose) onClose();
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? 'bg-white text-indigo-900 shadow-sm border border-white/60'
                            : 'text-indigo-100 hover:bg-white/10 hover:text-white border border-transparent'
                        }`}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-500 via-purple-500 to-fuchsia-500 rounded-r-full"></div>
                        )}
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              active ? 'bg-indigo-100' : 'group-hover:bg-white/10'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${active ? 'text-indigo-700' : 'text-indigo-200'}`} />
                          </div>
                          <span className="ml-3">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <p className="font-medium">Tracksy Driver</p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-indigo-100">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
