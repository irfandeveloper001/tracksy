import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { 
  HomeIcon, 
  MapIcon, 
  BookmarkIcon, 
  TruckIcon,
  BanknotesIcon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
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
import systemSettingsService, { getStoredSystemSettings } from "../../lib/api/systemSettingsService";

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
  user?: any;
}

export default function Sidebar({ onLogout, isOpen = false, onClose, user }: SidebarProps) {
  const location = useLocation();
  const { t } = useLanguage();
  const [appLogo, setAppLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = () => {
      const settings = getStoredSystemSettings();
      setAppLogo(settings?.app_logo || null);
    };
    loadLogo();
    if (!getStoredSystemSettings()?.app_logo) {
      systemSettingsService.getSystemSettings().catch(() => {});
    }
    window.addEventListener('storage', loadLogo);
    window.addEventListener('tracksy:settings-updated', loadLogo);
    return () => {
      window.removeEventListener('storage', loadLogo);
      window.removeEventListener('tracksy:settings-updated', loadLogo);
    };
  }, []);

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

  const sections = [
    {
      title: 'Main',
      items: navigation.slice(0, 2),
    },
    {
      title: 'Bookings',
      items: navigation.slice(2, 5),
    },
    {
      title: 'Account',
      items: navigation.slice(5),
    },
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
          w-72 bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl border-r border-white/10 ring-1 ring-white/10
          flex-shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand + User */}
          <div className="relative border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-white/90 flex items-center justify-center shadow-lg ring-1 ring-white/20 overflow-hidden">
                  {appLogo ? (
                    <img
                      src={appLogo}
                      alt="Tracksy Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                      {(user?.name || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-xs text-indigo-200 truncate">
                    ID: {user?.student_id || '—'}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-indigo-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Live
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = isActive(item.path) ? item.iconSolid : item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                            active ? 'bg-indigo-100' : 'group-hover:bg-white/10'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${active ? 'text-indigo-700' : 'text-indigo-200'}`} />
                        </div>
                        <span className="ml-3">{item.name}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Settings & Logout */}
          <div className="px-4 py-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 rounded-xl bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/30 transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
